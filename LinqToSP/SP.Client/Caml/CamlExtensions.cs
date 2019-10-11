using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using SP.Client.Caml.Clauses;
using SP.Client.Caml.Operators;

namespace SP.Client.Caml
{
    public static class CamlExtensions
    {
        public static void WhereAll(this Query query, params Operator[] operators)
        {
            operators = operators.Where(op => op != null).ToArray();
            if (operators.Length == 0) return;
            if (query.Where == null)
            {
                query.Where = new CamlWhere(operators.First());
                operators = operators.Skip(1).ToArray();
            }
            query.Where = new CamlWhere(query.Where.And(operators).Operator);
        }

        public static void WhereAny(this Query query, params Operator[] operators)
        {
            operators = operators.Where(op => op != null).ToArray();
            if (operators.Length == 0) return;
            if (query.Where == null)
            {
                query.Where = new CamlWhere(operators.First());
                operators = operators.Skip(1).ToArray();
            }
            query.Where = new CamlWhere(query.Where.Or(operators).Operator);
        }

        public static CamlWhere And(this CamlWhere firstWhere, CamlWhere secondWhere)
        {
            if (firstWhere == null) throw new ArgumentNullException("firstWhere");
            if (secondWhere == null) throw new ArgumentNullException("secondWhere");
            //var logicalJoin = firstWhere.Operator as LogicalJoin;
            //var @where = logicalJoin != null
            //    ? new CamlWhere(logicalJoin.CombineAnd(secondWhere.Operator))
            //    : new CamlWhere(firstWhere.Operator.And(secondWhere.Operator));
            var @where = new CamlWhere(firstWhere.Operator.And(secondWhere.Operator));
            return where;
        }

        //public static CamlWhere Or(this CamlWhere where, params Operator[] operators)
        //{
        //    //if (where == null) throw new ArgumentNullException("where");
        //    operators = operators.Where(op => op != null).ToArray();
        //    if (operators.Length > 0)
        //    {
        //        Operator @operator;
        //        if (where == null)
        //        {
        //            @operator = operators.First();
        //            @operator = operators.Skip(1).Aggregate(@operator, (current, op) => current.Or(op));
        //        }
        //        else
        //        {
        //            @operator = operators.Where(op => op != null)
        //                .Aggregate(@where.Operator, (current, op) => current.Or(op));
        //        }
        //        where = new CamlWhere(@operator);
        //    }
        //    return where;
        //}

        public static CamlWhere Or(this CamlWhere where, params Operator[] operators)
        {
            //if (where == null) throw new ArgumentNullException("where");
            operators = operators.Where(op => op != null).ToArray();
            if (operators.Length > 0)
            {
                Operator @operator;
                if (where == null)
                {
                    @operator = operators.First();
                    @operator = operators.Skip(1).Aggregate(@operator, (current, op) => current.AppendOr(op));
                }
                else
                {
                    @operator = operators.Where(op => op != null)
                        .Aggregate(@where.Operator, (current, op) => current.AppendOr(op));
                }
                where = new CamlWhere(@operator);
            }
            return where;
        }


        //public static CamlWhere And(this CamlWhere where, params Operator[] operators)
        //{
        //    //if (where == null) throw new ArgumentNullException("where");
        //    operators = operators.Where(op => op != null).ToArray();
        //    if (operators.Length > 0)
        //    {
        //        Operator @operator;
        //        if (where == null)
        //        {
        //            @operator = operators.First();
        //            @operator = operators.Skip(1).Aggregate(@operator, (current, op) => current.And(op));
        //        }
        //        else
        //        {
        //            @operator = operators.Where(op => op != null)
        //                .Aggregate(@where.Operator, (current, op) => current.And(op));
        //        }
        //        where = new CamlWhere(@operator);
        //    }
        //    return where;
        //}

        public static CamlWhere And(this CamlWhere where, params Operator[] operators)
        {
            //if (where == null) throw new ArgumentNullException("where");
            operators = operators.Where(op => op != null).ToArray();
            if (operators.Length > 0)
            {
                Operator @operator;
                if (where == null)
                {
                    @operator = operators.First();
                    @operator = operators.Skip(1).Aggregate(@operator, (current, op) => current.AppendAnd(op));
                }
                else
                {
                    @operator = operators.Where(op => op != null)
                        .Aggregate(@where.Operator, (current, op) => current.AppendAnd(op));
                }
                where = new CamlWhere(@operator);
            }
            return where;
        }

        public static CamlWhere Or(this CamlWhere firstWhere, CamlWhere secondWhere)
        {
            if (firstWhere == null) throw new ArgumentNullException("firstWhere");
            if (secondWhere == null) throw new ArgumentNullException("secondWhere");
            //var logicalJoin = firstWhere.Operator as LogicalJoin;
            //var @where = logicalJoin != null
            //    ? new CamlWhere(logicalJoin.CombineOr(secondWhere.Operator))
            //    : new CamlWhere(firstWhere.Operator.Or(secondWhere.Operator));
            var @where = new CamlWhere(firstWhere.Operator.Or(secondWhere.Operator));
            return where;
        }

        public static LogicalJoin And(this Operator @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return new And(new List<Operator> { @operator }.Union(operators));
        }

        public static LogicalJoin And(this LogicalJoin @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return @operator.CombineAnd(operators);
        }

        public static LogicalJoin And(this ComparisonOperator @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return new And(new List<Operator> { @operator }.Union(operators));
        }

        public static And AppendAnd(this Operator @operator, params Operator[] operators)
        {
            operators = operators ?? operators.Where(op => op != null).ToArray();
            if (operators.Length > 0)
            {
                var andLogicalJoin = new And(new[] { @operator, operators.Single() });
                andLogicalJoin = operators.Skip(1).Reverse().Aggregate(andLogicalJoin, (current, op) => new And(new[] { current, @op }));
                return andLogicalJoin;
            }
            return null;
        }

        public static LogicalJoin Or(this Operator @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return new Or(new List<Operator> { @operator }.Union(operators));
        }

        public static LogicalJoin Or(this LogicalJoin @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return @operator.CombineOr(operators);
        }

        public static LogicalJoin Or(this ComparisonOperator @operator, params Operator[] operators)
        {
            if (@operator == null) throw new ArgumentNullException("operator");
            return new Or(new List<Operator> { @operator }.Union(operators));
        }

        public static Or AppendOr(this Operator @operator, params Operator[] operators)
        {
            operators = operators ?? operators.Where(op => op != null).ToArray();
            if (operators.Length > 0)
            {
                var andLogicalJoin = new Or(new[] { @operator, operators.Single() });
                andLogicalJoin = operators.Skip(1).Reverse().Aggregate(andLogicalJoin, (current, op) => new Or(new[] { current, @op }));
                return andLogicalJoin;
            }
            return null;
        }

        public static CamlOrderBy ThenBy(this CamlOrderBy orderBy, Guid fieldId, bool? ascending = null)
        {
            return orderBy.ThenBy(new CamlFieldRef { Id = fieldId, Ascending = @ascending });
        }

        public static CamlOrderBy ThenBy(this CamlOrderBy orderBy, string fieldName, bool? ascending = null)
        {
            return orderBy.ThenBy(new CamlFieldRef { Name = fieldName, Ascending = @ascending });
        }

        public static CamlOrderBy ThenBy(this CamlOrderBy orderBy, CamlFieldRef fieldRef)
        {
            if (orderBy == null)
            {
                orderBy = new CamlOrderBy(fieldRef);
            }
            var fields = new List<CamlFieldRef>(orderBy) { fieldRef };
            return new CamlOrderBy(fields);
        }

        public static CamlGroupBy ThenBy(this CamlGroupBy groupBy, Guid fieldId, bool? collapse = null, int? limit = null)
        {
            return groupBy.ThenBy(new CamlFieldRef { Id = fieldId, Ascending = false }, collapse, limit);
        }

        public static CamlGroupBy BeforeBy(this CamlGroupBy groupBy, Guid fieldId, bool? collapse = null, int? limit = null)
        {
            return groupBy.BeforeBy(new CamlFieldRef { Id = fieldId, Ascending = false }, collapse, limit);
        }

        public static CamlGroupBy ThenBy(this CamlGroupBy groupBy, string fieldName, bool? collapse = null, int? limit = null)
        {
            return groupBy.ThenBy(new CamlFieldRef { Name = fieldName, Ascending = false }, collapse, limit);
        }

        public static CamlGroupBy BeforeBy(this CamlGroupBy groupBy, string fieldName, bool? collapse = null, int? limit = null)
        {
            return groupBy.BeforeBy(new CamlFieldRef { Name = fieldName, Ascending = false }, collapse, limit);
        }

        public static CamlGroupBy ThenBy(this CamlGroupBy groupBy, CamlFieldRef fieldRef, bool? collapse = null, int? limit = null)
        {
            if (groupBy == null)
            {
                return new CamlGroupBy(fieldRef, collapse, limit);
            }
            if (groupBy.Collapse != null)
            {
                collapse = collapse == null ? groupBy.Collapse.Value : collapse.Value | groupBy.Collapse.Value;
            }
            if (groupBy.Limit != null)
            {
                limit = limit == null ? groupBy.Limit.Value : Math.Max(limit.Value, groupBy.Limit.Value);
            }
            var fields = new List<CamlFieldRef>(groupBy) { fieldRef };
            return new CamlGroupBy(fields, collapse, limit);
        }

        public static CamlGroupBy BeforeBy(this CamlGroupBy groupBy, CamlFieldRef fieldRef, bool? collapse = null, int? limit = null)
        {
            if (groupBy == null)
            {
                return new CamlGroupBy(fieldRef, collapse, limit);
            }
            if (groupBy.Collapse != null)
            {
                collapse = collapse == null ? groupBy.Collapse.Value : collapse.Value | groupBy.Collapse.Value;
            }
            if (groupBy.Limit != null)
            {
                limit = limit == null ? groupBy.Limit.Value : Math.Max(limit.Value, groupBy.Limit.Value);
            }
            var fields = new List<CamlFieldRef> { fieldRef };
            fields.AddRange(groupBy);
            return new CamlGroupBy(fields, collapse, limit);
        }

        public static JoinsCamlElement Join(this JoinsCamlElement camlJoins, params Join[] joins)
        {
            if (@joins != null && joins.Length > 0)
            {
                camlJoins.AddRange(joins);
            }
            return camlJoins;
        }

        public static JoinsCamlElement Join(this JoinsCamlElement camlJoins, JoinsCamlElement combinedCamlJoins)
        {
            if (combinedCamlJoins != null && combinedCamlJoins.Any())
            {
                camlJoins = Join(camlJoins, combinedCamlJoins);
            }
            return camlJoins;
        }

        public static ViewFieldsCamlElement ViewField(this ViewFieldsCamlElement camlViewFields, params CamlFieldRef[] viewFields)
        {
            if (@viewFields != null)
            {
                var mergedViewFields = new List<CamlFieldRef>();
                if (camlViewFields.Any())
                {
                    mergedViewFields.AddRange(camlViewFields);
                }
                mergedViewFields.AddRange(viewFields);
                camlViewFields.ViewField(mergedViewFields.ToArray());
            }
            return camlViewFields;
        }

        public static ViewFieldsCamlElement ViewField(this ViewFieldsCamlElement camlViewFields, params string[] viewFields)
        {
            if (@viewFields != null)
            {
                var mergedViewFields = new List<CamlFieldRef>();
                if (camlViewFields.Any())
                {
                    mergedViewFields.AddRange(camlViewFields);
                }
                mergedViewFields.AddRange(viewFields.Where(@viewField => !mergedViewFields.Exists(field => field.Name == @viewField)).Select(viewField => new CamlFieldRef { Name = viewField }));
                camlViewFields.ViewField(mergedViewFields.ToArray());
            }
            return camlViewFields;
        }

        public static ProjectedFieldsCamlElement ShowField(this ProjectedFieldsCamlElement camlProjectedFields, params CamlProjectedField[] projectedFields)
        {
            if (camlProjectedFields != null)
                camlProjectedFields.AddRange(projectedFields);
            return camlProjectedFields;
        }

        public static ProjectedFieldsCamlElement ShowField(this ProjectedFieldsCamlElement camlProjectedFields, string fieldName, string listAlias, string lookupField)
        {
            if (camlProjectedFields != null)
                camlProjectedFields.Add(new CamlProjectedField(fieldName, listAlias, lookupField));
            return camlProjectedFields;
        }

        public static ProjectedFieldsCamlElement ShowField(this ProjectedFieldsCamlElement camlProjectedFields, ProjectedFieldsCamlElement combinedProjectedFields)
        {
            if (camlProjectedFields != null)
            {
                camlProjectedFields = camlProjectedFields.ShowField(combinedProjectedFields);
            }
            return camlProjectedFields;

        }
    }
}