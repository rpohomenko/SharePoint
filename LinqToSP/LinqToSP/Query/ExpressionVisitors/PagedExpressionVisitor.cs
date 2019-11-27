using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.Utilities;
using Remotion.Linq;
using Remotion.Linq.Clauses;
using Remotion.Linq.Clauses.Expressions;
using Remotion.Linq.Clauses.ResultOperators;
using SP.Client.Helpers;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Query.Expressions;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class PagedExpressionVisitor<TContext, TEntity> : SpGeneratorQueryModelVisitor<TContext, TEntity>
         where TContext : class, ISpEntryDataContext
         where TEntity : class, IListItemEntity, new()
    {
        private readonly SpQueryArgs<TContext> _args;
        private readonly PagedExpression<TContext/*, TEntity*/> _expression;
        private readonly Caml.View _spView;

        public PagedExpressionVisitor(SpQueryArgs<TContext> args, PagedExpression<TContext/*, TEntity*/> expression, Caml.View spView) : base(args, null)
        {
            _args = args;
            _expression = expression;
            _spView = spView;
        }

        public string PagingInfo
        {
            get
            {
                return _args.PagingInfo;
            }
            private set
            {
                _args.PagingInfo = value;
            }
        }

        protected override void VisitBodyClauses(ObservableCollection<IBodyClause> bodyClauses, QueryModel queryModel)
        {
            //base.VisitBodyClauses(bodyClauses, queryModel);
            if (_expression != null && _args != null)
            {
                if (_args != _expression.Args) return;
                var item = _expression.Item;
                if (item != null)
                {
                    StringBuilder sb = new StringBuilder();
                    bool isIdSet = false;
                    foreach (var orderClause in bodyClauses.OfType<OrderByClause>())
                    {
                        if (orderClause != null)
                        {
                            foreach (var ordering in orderClause.Orderings)
                            {
                                string sortFieldKey = (ordering.Expression as MemberExpression).Member.Name;
                                if (_args.FieldMappings.ContainsKey(sortFieldKey))
                                {
                                    var fieldMap = _args.FieldMappings[sortFieldKey];
                                    if (fieldMap.Sortable == false) continue;
                                    object value = item[fieldMap.Name];

                                    if (fieldMap.DataType == FieldType.MultiChoice)
                                    {
                                        continue;
                                    }
                                    else if (fieldMap is ChoiceFieldAttribute && (fieldMap as ChoiceFieldAttribute).IsMultiple)
                                    {
                                        continue;
                                    }
                                    else if (fieldMap is NoteFieldAttribute)
                                    {
                                        continue;
                                    }

                                    if (value is DateTime)
                                    {
                                        value = Convert.ToDateTime(value).ToUniversalTime().ToString("yyyyMMdd HH:mm:ss");
                                    }
                                    else if (value is FieldLookupValue)
                                    {
                                        value = (value as FieldLookupValue).LookupValue;
                                    }
                                    else if (value is ICollection<FieldLookupValue>)
                                    {
                                        continue;
                                    }
                                    else if (value is FieldUrlValue)
                                    {
                                        value = string.IsNullOrEmpty((value as FieldUrlValue).Description)
                                            ? (value as FieldUrlValue).Url
                                            : (value as FieldUrlValue).Description;
                                    }
                                    else if (value is bool)
                                    {
                                        value = Convert.ToBoolean(value) == true ? 1 : 0;
                                    }
                                    else
                                    {
                                        if (value != null && value.GetType().IsArray) continue;
                                        value = SpConverter.ConvertValue(value, typeof(string));
                                    }
                                    if (sb.Length > 0)
                                    {
                                        sb.Append("&");
                                    }
                                    sb.Append($"p_{fieldMap.Name}={HttpUtility.UrlKeyValueEncode(Convert.ToString(value))}");
                                    if (fieldMap.Name == "ID")
                                    {
                                        isIdSet = true;
                                    }
                                }
                            }
                        }
                    }
                    if (!isIdSet)
                    {
                        if (sb.Length > 0)
                        {
                            sb.Append("&");
                        }
                        sb.Append($"p_ID={item.Id}");
                    }
                    PagingInfo = _expression.IsPrev ? $"Paged=TRUE&PagedPrev=TRUE&{sb.ToString()}" : $"Paged=TRUE&{sb.ToString()}";
                }
            }
        }


        //protected override void VisitBodyClauses(ObservableCollection<IBodyClause> bodyClauses, QueryModel queryModel)
        //{
        //    //base.VisitBodyClauses(bodyClauses, queryModel);
        //    if (_expression != null && _args != null)
        //    {
        //        if (_args != _expression.Args) return;
        //        var entity = _expression.Entity;
        //        if (entity != null)
        //        {
        //            StringBuilder sb = new StringBuilder();
        //            bool isIdSet = false;
        //            foreach (var orderClause in bodyClauses.OfType<OrderByClause>())
        //            {
        //                if (orderClause != null)
        //                {
        //                    foreach (var ordering in orderClause.Orderings)
        //                    {
        //                        string sortFieldKey = (ordering.Expression as MemberExpression).Member.Name;
        //                        Type type = (ordering.Expression as MemberExpression).Member.GetMemberType();
        //                        if (_args.FieldMappings.ContainsKey(sortFieldKey))
        //                        {
        //                            var fieldMap = _args.FieldMappings[sortFieldKey];
        //                            if (fieldMap.Sortable == false) continue;

        //                            if (fieldMap.DataType == FieldType.Lookup)
        //                            {
        //                                if (fieldMap is LookupFieldAttribute)
        //                                {
        //                                    if ((fieldMap as LookupFieldAttribute).IsMultiple)
        //                                    {
        //                                        continue;
        //                                    }
        //                                    else if ((fieldMap as LookupFieldAttribute).Result != LookupItemResult.Value)
        //                                    {
        //                                        if (!typeof(FieldLookupValue).IsAssignableFrom(type))
        //                                        {
        //                                            continue;
        //                                        }
        //                                    }
        //                                }
        //                                else if (!typeof(FieldLookupValue).IsAssignableFrom(type))
        //                                {
        //                                    continue;
        //                                }
        //                            }
        //                            else if (fieldMap.DataType == FieldType.MultiChoice)
        //                            {
        //                                continue;
        //                            }
        //                            else if (fieldMap is ChoiceFieldAttribute && (fieldMap as ChoiceFieldAttribute).IsMultiple)
        //                            {
        //                                continue;
        //                            }
        //                            else if (fieldMap is NoteFieldAttribute)
        //                            {
        //                                continue;
        //                            }
        //                            object value = null;
        //                            var prop = typeof(TEntity).GetProperty(sortFieldKey);
        //                            if (prop != null)
        //                            {
        //                                if (prop.CanRead)
        //                                {
        //                                    value = prop.GetValue(entity);
        //                                }
        //                            }
        //                            else
        //                            {
        //                                var field = typeof(TEntity).GetField(sortFieldKey);
        //                                if (field != null)
        //                                {
        //                                    value = field.GetValue(entity);
        //                                }
        //                            }
        //                            if (value is DateTime)
        //                            {
        //                                value = Convert.ToDateTime(value).ToUniversalTime().ToString("yyyyMMdd HH:mm:ss");
        //                            }
        //                            else if (value is FieldLookupValue)
        //                            {
        //                                value = (value as FieldLookupValue).LookupValue;
        //                            }
        //                            else if (value is ICollection<FieldLookupValue>)
        //                            {
        //                                continue;
        //                            }
        //                            else
        //                            {
        //                                if (type.IsArray) continue;
        //                                value = SpConverter.ConvertValue(value, typeof(string));
        //                            }
        //                            if (sb.Length > 0)
        //                            {
        //                                sb.Append("&");
        //                            }
        //                            sb.Append($"p_{fieldMap.Name}={HttpUtility.UrlKeyValueEncode(Convert.ToString(value))}");
        //                            if (fieldMap.Name == "ID")
        //                            {
        //                                isIdSet = true;
        //                            }
        //                        }
        //                    }
        //                }
        //            }
        //            if (!isIdSet)
        //            {
        //                if (sb.Length > 0)
        //                {
        //                    sb.Append("&");
        //                }
        //                sb.Append($"p_ID={entity.Id}");
        //            }
        //            PagingInfo = _expression.IsPrev ? $"Paged=TRUE&PagedPrev=TRUE&{sb.ToString()}" : $"Paged=TRUE&{sb.ToString()}";
        //        }
        //    }
        //}

        public override void VisitResultOperator(ResultOperatorBase resultOperator, QueryModel queryModel, int index)
        {
            if (resultOperator is ConcatResultOperator)
            {
                var source = (resultOperator as ConcatResultOperator).Source2 as SubQueryExpression;
                if (source != null)
                {
                    this.VisitQueryModel(source.QueryModel);
                }
            }
            base.VisitResultOperator(resultOperator, queryModel, index);
        }
    }
}
