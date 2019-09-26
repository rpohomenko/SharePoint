using JetBrains.Annotations;
using SP.Client.Extensions;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml
{
    public sealed class ProjectedFieldsCamlElement : CamlElement, ICollection<CamlProjectedField>
    {
        internal const string ProjectedFieldsTag = "ProjectedFields";

        public ProjectedFieldsCamlElement() : base(ProjectedFieldsTag)
        {
        }

        public ProjectedFieldsCamlElement(IEnumerable<CamlProjectedField> projectedFields) : base(ProjectedFieldsTag)
        {
            if (projectedFields != null) ProjectedFields = projectedFields;
        }

        public ProjectedFieldsCamlElement(string existingJoins) : base(ProjectedFieldsTag, existingJoins)
        {
        }

        public ProjectedFieldsCamlElement(XElement existingJoins) : base(ProjectedFieldsTag, existingJoins)
        {
        }

        private IEnumerable<CamlProjectedField> ProjectedFields { get; set; }

        public int Count => (ProjectedFields != null ? ProjectedFields.Count() : 0);

        public bool IsReadOnly => true;

        protected override void OnParsing(XElement existingProjectedFields)
        {
            ProjectedFields =
                existingProjectedFields.ElementsIgnoreCase(CamlProjectedField.FieldTag)
                    .Select(existingProjectedField => new CamlProjectedField(existingProjectedField));
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (ProjectedFields != null)
            {
                foreach (var projectedField in ProjectedFields.Where(projectedField => projectedField != null))
                {
                    el.Add(projectedField.ToXElement());
                }
            }
            return el;
        }


        public void Add([NotNull] CamlProjectedField item)
        {
            if (item != null)
                if (ProjectedFields != null)
                {
                    var fieldRefs = ProjectedFields.ToArray();
                    var field = fieldRefs.FirstOrDefault(fRef => fRef.Name == item.Name);
                    if (field == null)
                    {
                        ProjectedFields = fieldRefs.Concat(new[] { item });
                    }
                    else
                    {
                        field.List = item.List;
                        field.ShowField = item.ShowField;
                        ProjectedFields = fieldRefs.AsEnumerable();
                    }
                }
                else
                {
                    ProjectedFields = new[] { item }.AsEnumerable();
                }
        }

        public void AddRange([NotNull] IEnumerable<CamlProjectedField> items)
        {
            if (items != null)
            {
                foreach (var item in items)
                {
                    Add(item);
                }
            }
        }

        public void Clear()
        {
            ProjectedFields = Enumerable.Empty<CamlProjectedField>();
        }

        public bool Contains([NotNull] CamlProjectedField item)
        {
            if (item != null && ProjectedFields != null)
                return ProjectedFields.Any(f => f.Name == item.Name);
            return false;
        }

        public void CopyTo(CamlProjectedField[] array, int arrayIndex)
        {
            if (ProjectedFields != null)
                ProjectedFields.ToArray().CopyTo(array, arrayIndex);
        }       

        public bool Remove([NotNull] CamlProjectedField item)
        {
            if (item != null && ProjectedFields != null)
            {
                return ProjectedFields.ToList().RemoveAll(f => f.Name == item.Name) > 0;
            }
            return false;
        }

        IEnumerator<CamlProjectedField> IEnumerable<CamlProjectedField>.GetEnumerator()
        {
            return GetEnumerator() as IEnumerator<CamlProjectedField>;
        }

        public IEnumerator GetEnumerator()
        {
            return ProjectedFields != null ? ProjectedFields.GetEnumerator() : Enumerable.Empty<CamlProjectedField>().GetEnumerator();
        }

    }
}