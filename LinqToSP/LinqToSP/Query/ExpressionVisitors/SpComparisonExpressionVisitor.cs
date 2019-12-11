using Microsoft.SharePoint.Client;
using SP.Client.Caml;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using System;
using System.Linq.Expressions;

namespace SP.Client.Linq.Query.ExpressionVisitors
{
  internal class SpComparisonExpressionVisitor<TContext> : SpExpressionVisitor<TContext>
   where TContext : ISpDataContext

  {
    public SpComparisonExpressionVisitor(SpQueryArgs<TContext> args) : base(args)
    {
    }

    protected string FieldName { get; private set; }
    protected object FieldValue { get; /*private*/ set; }

    protected Type FieldType { get; private set; }

    protected CamlFieldRef GetFieldRef(out FieldType dataType)
    {
      return GetFieldRef(FieldName, out dataType);
    }

    protected CamlFieldRef GetFieldRef(string fieldName, out FieldType dataType)
    {
      dataType = Microsoft.SharePoint.Client.FieldType.Invalid;
      if (SpQueryArgs != null && !string.IsNullOrEmpty(fieldName))
        if (SpQueryArgs.FieldMappings.ContainsKey(fieldName))
        {
          var fieldMap = SpQueryArgs.FieldMappings[fieldName];
          if (fieldMap.Filterable == false)
          {
            throw new Exception($"Field '{fieldName}' is not filterable.");
          }
          var fieldRef = new CamlFieldRef() { Name = fieldMap.Name };
          if (fieldMap is LookupFieldAttribute)
          {
            if ((fieldMap as LookupFieldAttribute).Result == LookupItemResult.Id)
            {
              fieldRef.LookupId = true;
            }
          }
          dataType = fieldMap.DataType;
          return fieldRef;
        }
        else
        {
          throw new Exception($"Cannot find '{fieldName}' mapping field. Check '{typeof(FieldAttribute)}'.");
        }
      return null;
    }

    protected CamlValue GetValue(FieldType dataType)
    {
      if (FieldValue != null)
      {
        Type valueType = FieldValue.GetType();
        if (valueType.IsEnum)
        {
          FieldValue = EnumExtensions.GetChoiceValueString(valueType, FieldValue);
        }
        var value = FieldValue is CamlValue ? (CamlValue)FieldValue : new CamlValue(FieldValue, dataType);
        if (value != null && !(FieldValue is CamlValue.DateCamlValue))
        {
          if (dataType == Microsoft.SharePoint.Client.FieldType.DateTime)
          {
            value.IncludeTimeValue = true;
            value.StorageTZ = true;
          }
        }
        return value;
      }
      return null;
    }

    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
      Expression expression = node;
      if (node.Method.Name == "Equals")
      {
        foreach (var arg in node.Arguments)
        {
          Visit(arg);
        }

        FieldType dataType;
        CamlFieldRef fieldRef = GetFieldRef(out dataType);
        CamlValue value = GetValue(dataType);

        Operator = new Caml.Operators.Eq(fieldRef, value);
      }
      return expression;
    }

    protected override Expression VisitBinary(BinaryExpression exp)
    {
      LeftOperator = ToOperator(exp.Left);
      RightOperator = ToOperator(exp.Right);
      FieldType dataType;
      CamlFieldRef fieldRef = GetFieldRef(out dataType);
      CamlValue value = GetValue(dataType);
      if (fieldRef == null)
      {
        return exp;
      }
      switch (exp.NodeType)
      {
        case ExpressionType.Equal:
          if (exp.Right.IsNullValue())
          {
            Operator = new Caml.Operators.IsNull(fieldRef);
          }
          else
          {
            Operator = new Caml.Operators.Eq(fieldRef, value);
          }
          break;
        case ExpressionType.NotEqual:
          if (exp.Right.IsNullValue())
          {
            Operator = new Caml.Operators.IsNotNull(fieldRef);
          }
          else
          {
            Operator = new Caml.Operators.Neq(fieldRef, value);
          }
          break;
        case ExpressionType.GreaterThan:
          Operator = new Caml.Operators.Gt(fieldRef, value);
          break;
        case ExpressionType.GreaterThanOrEqual:
          Operator = new Caml.Operators.Geq(fieldRef, value);
          break;
        case ExpressionType.LessThan:
          Operator = new Caml.Operators.Lt(fieldRef, value);
          break;
        case ExpressionType.LessThanOrEqual:
          Operator = new Caml.Operators.Leq(fieldRef, value);
          break;
        //case ExpressionType.Convert:
        //    Visit(exp);
        //    break;
        default:
          throw new NotSupportedException($"{exp.NodeType} operator is not supported in LinqToSP.");
      }
      return exp;
    }

    protected override Expression VisitMember(MemberExpression exp)
    {
      FieldName = exp.Member.Name;
      FieldType = exp.Member.MemberType == System.Reflection.MemberTypes.Property
        ? (exp.Member as System.Reflection.PropertyInfo).PropertyType
        : (exp.Member as System.Reflection.FieldInfo).FieldType;
      return exp;
    }

    protected override Expression VisitConstant(ConstantExpression exp)
    {
      FieldValue = exp.Value;
      if (FieldType != null && FieldType.IsEnum)
      {
        FieldValue = EnumExtensions.GetChoiceValueString(FieldType, FieldValue);
      }
      return exp;
    }
  }

}
