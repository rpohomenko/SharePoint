using Microsoft.SharePoint.Client;
using System;

namespace SP.Client.Linq.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, Inherited = true, AllowMultiple = false)]
    public class FieldAttribute : Attribute
    {
        public FieldAttribute()
        {
        }

        public FieldAttribute(string name) : this(name, FieldType.Text)
        {
        }

        public FieldAttribute(string name, FieldType dataType)
        {
            Name = name;
            DataType = dataType;
        }

        public virtual string Title { get; set; }

        public virtual string Name { get; set; }

        public virtual bool Required { get; set; }

        public virtual bool IsReadOnly { get; set; }

        public virtual FieldType DataType { get; set; }

        public int Order { get; set; }

        public override string ToString()
        {
            if (!string.IsNullOrWhiteSpace(Name))
            {
                return Name;
            }
            return base.ToString();
        }
    }
}
