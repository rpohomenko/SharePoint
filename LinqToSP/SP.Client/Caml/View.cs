using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;


namespace SP.Client.Caml
{
    public sealed class View : CamlElement
    {
        internal const string ViewTag = "View";
        internal const string ScopeAttr = "FieldRef";

        public View(int rowLimit = 0, bool? paged = null) : this(null, null, null, rowLimit, paged)
        {
        }

        public View(IEnumerable<string> viewFields, int rowLimit = 0, bool? paged = null) : this(viewFields, null, null, rowLimit, paged)
        {
        }

        public View(IEnumerable<Join> joins, IEnumerable<CamlProjectedField> projectedFields, int rowLimit = 0, bool? paged = null) : this(null, joins, projectedFields, rowLimit, paged)
        {
        }

        public View(IEnumerable<string> viewFields, IEnumerable<Join> joins, IEnumerable<CamlProjectedField> projectedFields, int rowLimit = 0, bool? paged = null) : base(ViewTag)
        {
            Query = new Query();
            ViewFields = new ViewFieldsCamlElement(viewFields);
            Joins = new JoinsCamlElement(joins);
            ProjectedFields = new ProjectedFieldsCamlElement(projectedFields);
            RowLimit = new CamlRowLimit(rowLimit, paged);
            Scope = ViewScope.DefaultValue;
        }

        public View(string existingView) : base(ViewTag, existingView)
        {
        }

        public View(XElement existingView) : base(ViewTag, existingView)
        {
        }

        public Query Query { get; private set; }
        internal CamlRowLimit RowLimit { get; set; }

        public bool? Paged
        {
            get { return RowLimit.Paged; }
            set { RowLimit.Paged = value; }
        }

        public int Limit
        {
            get { return RowLimit.Limit; }
            set { RowLimit.Limit = value; }
        }

        public ViewScope Scope { get; set; }

        public ViewFieldsCamlElement ViewFields { get; set; }
        public JoinsCamlElement Joins { get; set; }
        public ProjectedFieldsCamlElement ProjectedFields { get; set; }

        protected override void OnParsing(XElement existingView)
        {
            var existingQuery = existingView.ElementIgnoreCase(Query.QueryTag);
            if (existingQuery != null)
            {
                Query = new Query(existingQuery);
            }
            var existingRowLimit = existingView.ElementIgnoreCase(CamlRowLimit.RowLimitTag);
            if (existingRowLimit != null)
            {
                RowLimit = new CamlRowLimit(existingRowLimit);
            }
            var existingViewFields = existingView.ElementIgnoreCase(ViewFieldsCamlElement.ViewFieldsTag);
            if (existingViewFields != null)
            {
                ViewFields = new ViewFieldsCamlElement(existingViewFields);
            }
            var existingJoins = existingView.ElementIgnoreCase(JoinsCamlElement.JoinsTag);
            if (existingJoins != null)
            {
                Joins = new JoinsCamlElement(existingJoins);
            }
            var projectedFields = existingView.ElementIgnoreCase(ProjectedFieldsCamlElement.ProjectedFieldsTag);
            if (projectedFields != null)
            {
                ProjectedFields = new ProjectedFieldsCamlElement(projectedFields);
            }
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Scope != ViewScope.DefaultValue)
            {
                el.Add(new XAttribute("Scope", Enum.GetName(typeof(ViewScope), Scope)));
            }
            var queryElement = Query.ToXElement();
            if (queryElement != null)
            {
                el.Add(queryElement);
            }
            if ((ViewFields != null ? ViewFields.FieldRefs : null) != null && ViewFields.FieldRefs.Any())
            {
                el.Add(ViewFields.ToXElement());
            }
            if (Joins != null && Joins.Any())
            {
                el.Add(Joins.ToXElement());
            }
            if (ProjectedFields != null && ProjectedFields.Any())
            {
                el.Add(ProjectedFields.ToXElement());
            }
            if (RowLimit != null && RowLimit.Limit > 0)
            {
                el.Add(RowLimit.ToXElement());
            }
            return el;
        }
    }
}