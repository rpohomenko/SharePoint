using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
    internal class SpDateRangesOverlapExpressionVisitor<TContext> : SpComparisonExpressionVisitor<TContext>
        where TContext : ISpDataContext
    {
        protected string StartTimeFieldName { get; private set; }
        protected string EndTimeFieldName { get; private set; }
        protected string RecurrenceDataFieldName { get; private set; }

        public SpDateRangesOverlapExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
        {
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            if (node.Method.Name == "DateRangesOverlap" /*&& typeof(ListItemEntityExtensions).IsAssignableFrom(node.Method.DeclaringType)*/)
            {
                Visit(node.Object);
                foreach (var arg in node.Arguments)
                {
                    if (arg.NodeType == ExpressionType.MemberAccess || arg.NodeType == ExpressionType.Constant || arg.NodeType == ExpressionType.Lambda)
                    {
                        Visit(arg);
                    }
                }

                FieldType dataType;
                CamlFieldRef startTimeFieldRef = GetFieldRef(StartTimeFieldName, out dataType);
                CamlFieldRef endTimeFieldRef = GetFieldRef(EndTimeFieldName, out dataType);
                CamlFieldRef recurrenceDataFieldRef = GetFieldRef(RecurrenceDataFieldName, out dataType);
                CamlValue value = GetValue(Microsoft.SharePoint.Client.FieldType.DateTime);
                value.IncludeTimeValue = null;

                if (startTimeFieldRef == null || endTimeFieldRef == null || recurrenceDataFieldRef == null || value == null)
                {
                    return node;
                }

                Operator = new Caml.Operators.DateRangesOverlap(startTimeFieldRef, endTimeFieldRef, recurrenceDataFieldRef, value);
                return node;
            }
            throw new NotSupportedException($"{node.NodeType} method is not supported in LinqToSP.");
        }

        protected override Expression VisitMember(MemberExpression exp)
        {
            if (string.IsNullOrEmpty(StartTimeFieldName))
            {
                StartTimeFieldName = exp.Member.Name;
            }
            else if (string.IsNullOrEmpty(EndTimeFieldName))
            {
                EndTimeFieldName = exp.Member.Name;
            }
            else if (string.IsNullOrEmpty(RecurrenceDataFieldName))
            {
                RecurrenceDataFieldName = exp.Member.Name;
            }
            return exp;
        }
    }
}
