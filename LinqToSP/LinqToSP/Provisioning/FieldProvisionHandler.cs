using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq.Provisioning
{
    public sealed class FieldProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity
    {
        private readonly FieldAttribute _field;
        private readonly ContentTypeAttribute _contentType;
        private readonly ListAttribute _list;
        private readonly Type _valueType;

        public FieldAttribute Field { get => _field; }


        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioning;

        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioned;

        public FieldProvisionHandler(FieldAttribute field, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, null, list, model, valueType)
        {
        }

        public FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, contentType, null, model, valueType)
        {
        }

        public FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : base(model)
        {
            _field = field;
            _contentType = contentType;
            _list = list;
            _valueType = valueType;
        }

        private List GetLookupList(Type lookupEntityType)
        {
            var lookupList = AttributeHelper.GetCustomAttributes<ListAttribute>(lookupEntityType, false).FirstOrDefault();
            if (lookupList != null)
            {
                var context = Model.Context.Context;
                List list = !string.IsNullOrEmpty(lookupList.Url)
                        ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{lookupList.Url.TrimStart('/')}")
                        : (!string.IsNullOrEmpty(lookupList.Title) ? context.Web.Lists.GetByTitle(lookupList.Title) : null);

                if (list != null)
                {
                    context.Load(list);
                    context.ExecuteQuery();
                }
                return list;
            }
            return null;
        }

        public override void Provision()
        {
            if (_field != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                //ContentType contentType = null;
                Field field = null;

                if (_list != null)
                {
                    list = _list.Url != null
                      ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{_list.Url.TrimStart('/')}")
                      : (_list.Title != null ? context.Web.Lists.GetByTitle(_list.Title) : null);
                }

                //if (_contentType != null)
                //{
                //    string ctName = _contentType.Name;
                //    string ctId = _contentType.Id;

                //    if (!string.IsNullOrEmpty(ctId))
                //    {
                //        if (list != null)
                //        {
                //            //contentType = list.ContentTypes.GetById(ctId);
                //            var listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Id.StringValue == ctId || ct.Parent.Id.StringValue == ctId));
                //            try
                //            {
                //                context.ExecuteQuery();
                //                contentType = listContentTypes.FirstOrDefault();
                //            }
                //            catch { }
                //        }
                //        else
                //        {
                //            contentType = web.AvailableContentTypes.GetById(ctId);
                //            context.Load(contentType);
                //            try
                //            {
                //                context.ExecuteQuery();
                //                ctName = contentType.Name;
                //            }
                //            catch
                //            {
                //                contentType = null;
                //            }
                //        }
                //    }
                //    else if (!string.IsNullOrEmpty(ctName))
                //    {
                //        IEnumerable<ContentType> listContentTypes = null;
                //        if (list != null)
                //        {
                //            listContentTypes = context.LoadQuery(list.ContentTypes.Where(ct => ct.Name == ctName));
                //            try
                //            {
                //                context.ExecuteQuery();
                //                contentType = listContentTypes.FirstOrDefault();
                //            }
                //            catch
                //            {
                //            }
                //        }
                //        else
                //        {
                //            IEnumerable<ContentType> webContentTypes = context.LoadQuery(web.AvailableContentTypes.Where(ct => ct.Name == ctName));
                //            try
                //            {
                //                context.ExecuteQuery();
                //                contentType = webContentTypes.FirstOrDefault();
                //            }
                //            catch
                //            {
                //            }
                //        }
                //    }
                //}

                string fieldXml = _field.DataType == FieldType.Calculated
                    ? $"<Field Type='{_field.DataType}' Name='{_field.Name}' StaticName='{_field.Name}' DisplayName='{_field.Title ?? _field.Name}' ResultType='{{2}}'><Formula>{{0}}</Formula><FieldRefs>{{1}}</FieldRefs></Field>"
                    : $"<Field Type='{_field.DataType}' Name='{_field.Name}' StaticName='{_field.Name}' DisplayName='{_field.Title ?? _field.Name}' />";

                var fields = list != null ? list.Fields : web.Fields;
                field = fields.GetByInternalNameOrTitle(_field.Name);
                try
                {
                    context.Load(field);
                    context.ExecuteQuery();
                }
                catch
                {
                    field = null;
                }

                if (field == null)
                {
                    if (_field.DataType == FieldType.Calculated)
                    {
                        if (typeof(CalculatedFieldAttribute).IsAssignableFrom(_field.GetType()))
                        {
                            string fieldRefs = (_field as CalculatedFieldAttribute).FieldRefs == null
                                ? null
                                : string.Join("", (_field as CalculatedFieldAttribute).FieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToString()));
                            string formula = (_field as CalculatedFieldAttribute).Formula;

                            if (!string.IsNullOrEmpty(fieldRefs) && formula != null)
                            {
                                var refFields = new List<Field>();
                                foreach (string fieldName in (_field as CalculatedFieldAttribute).FieldRefs)
                                {
                                    var refField = fields.GetByInternalNameOrTitle(fieldName);
                                    context.Load(refField, f => f.Title, f => f.InternalName, f => f.Id);
                                    refFields.Add(refField);
                                }
                                context.ExecuteQuery();
                                foreach (Field refField in refFields)
                                {
                                    formula = formula.Replace($"[{refField.InternalName}]", $"[{refField.Title}]");
                                }
                            }

                            fieldXml = string.Format(fieldXml, System.Security.SecurityElement.Escape(formula), fieldRefs, (_field as CalculatedFieldAttribute).ResultType);
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = _field.DataType;
                            field.ReadOnlyField = _field.IsReadOnly;
                            var calculatedField = context.CastTo<FieldCalculated>(field);
                            calculatedField.OutputType = (_field as CalculatedFieldAttribute).ResultType;
                            calculatedField.Formula = formula;
                            OnProvisioning?.Invoke(this, calculatedField);
                        }
                    }
                    else
                    {
                        if (_field.DataType == FieldType.Lookup)
                        {
                            if (_valueType != null && typeof(ISpEntityLookup).IsAssignableFrom(_valueType) || typeof(ISpEntityLookupCollection).IsAssignableFrom(_valueType))
                            {
                                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                                field.FieldTypeKind = _field.DataType;
                                field.Required = _field.Required;
                                field.ReadOnlyField = _field.IsReadOnly;

                                var lookupField = context.CastTo<FieldLookup>(field);
                                if (typeof(LookupFieldAttribute).IsAssignableFrom(_field.GetType()))
                                {
                                    lookupField.AllowMultipleValues = (_field as LookupFieldAttribute).IsMultiple;
                                }

                                Type lookupEntityType = _valueType.GenericTypeArguments.FirstOrDefault();
                                var lookupList = GetLookupList(lookupEntityType);
                                if (lookupList != null)
                                {
                                    lookupField.LookupList = lookupList.Id.ToString();
                                    lookupField.LookupField = "Title";
                                }

                                OnProvisioning?.Invoke(this, lookupField);
                            }
                            else
                            {
                                field = null;
                            }
                        }
                        else if ((_field.DataType == FieldType.Choice || _field.DataType == FieldType.MultiChoice) && _valueType.IsEnum)
                        {
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = _field.DataType;
                            field.Required = _field.Required;
                            field.ReadOnlyField = _field.IsReadOnly;

                            var choiceField = context.CastTo<FieldChoice>(field);
                            var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(_valueType).Select(choice => choice.Value);
                            choiceField.Choices = choices.OrderBy(choice => choice.Index).Select(choice => choice.Value).ToArray();

                            OnProvisioning?.Invoke(this, choiceField);
                        }
                        else
                        {
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = _field.DataType;
                            field.Required = _field.Required;
                            field.ReadOnlyField = _field.IsReadOnly;

                            OnProvisioning?.Invoke(this, field);
                        }
                    }
                    if (field != null)
                    {
                        field.Update();
                        context.Load(field);
                        context.ExecuteQuery();

                        OnProvisioned?.Invoke(this, field);
                    }
                }

                //OnProvisioned?.Invoke(this, field);

                //if (contentType != null && !contentType.Sealed && field != null)
                //{
                //    Guid fieldId = field.Id;
                //    var fieldLink = contentType.FieldLinks.GetById(fieldId);

                //    try
                //    {
                //        context.Load(contentType.FieldLinks);
                //        context.Load(fieldLink);
                //        context.ExecuteQuery();
                //        fieldLink = contentType.FieldLinks.FirstOrDefault(f => f.Id == fieldId);
                //    }
                //    catch
                //    {
                //        fieldLink = null;
                //    }

                //    if (fieldLink == null)
                //    {
                //        fieldLink = contentType.FieldLinks.Add(new FieldLinkCreationInformation() { Field = field });
                //        contentType.Update(false);
                //        context.ExecuteQuery();
                //    }
                //}
            }
        }
    }
}

