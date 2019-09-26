using JetBrains.Annotations;
using SP.Client.Extensions;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Caml
{
    public sealed class JoinsCamlElement : CamlElement, ICollection<Join>
    {
        internal const string JoinsTag = "Joins";

        public JoinsCamlElement() : base(JoinsTag)
        {
        }

        public JoinsCamlElement(IEnumerable<Join> joins) : base(JoinsTag)
        {
            if (joins != null) Joins = joins;
        }

        public JoinsCamlElement(string existingJoins) : base(JoinsTag, existingJoins)
        {
        }

        public JoinsCamlElement(XElement existingJoins) : base(JoinsTag, existingJoins)
        {
        }

        private IEnumerable<Join> Joins { get; set; }

        public int Count => (Joins != null ? Joins.Count() : 0);

        public bool IsReadOnly => true;

        protected override void OnParsing(XElement existingJoins)
        {
            Joins = existingJoins.ElementsIgnoreCase(Join.JoinTag).Select(Join.GetJoin);
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Joins != null)
            {
                foreach (var join in Joins.Where(join => @join != null))
                {
                    el.Add(@join.ToXElement());
                }
            }
            return el;
        }

        public void Add(Join item)
        {
            Joins = Joins ?? Enumerable.Empty<Join>();
            Joins = Joins.Concat(new[] { item });
        }

        public void AddRange([NotNull] IEnumerable<Join> items)
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
            Joins = Enumerable.Empty<Join>();
        }

        public bool Contains(Join item)
        {
            if (item != null && Joins != null)
                return Joins.Contains(item);
            return false;
        }

        public void CopyTo(Join[] array, int arrayIndex)
        {
            if (Joins != null)
                Joins.ToArray().CopyTo(array, arrayIndex);
        }

        public bool Remove(Join item)
        {
            if (Joins != null)
                return Joins.ToList().Remove(item);
            return false;
        }

        IEnumerator<Join> IEnumerable<Join>.GetEnumerator()
        {
            return GetEnumerator() as IEnumerator<Join>;
        }

        public IEnumerator GetEnumerator()
        {
            return Joins != null ? Joins.GetEnumerator() : Enumerable.Empty<Join>().GetEnumerator();
        }
    }
}