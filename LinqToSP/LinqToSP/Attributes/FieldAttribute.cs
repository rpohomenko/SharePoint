using Microsoft.SharePoint.Client;
using SP.Client.Linq.Provisioning;
using System;

namespace SP.Client.Linq.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, Inherited = true, AllowMultiple = false)]
    public class FieldAttribute : Attribute
    {
        public FieldAttribute()
        {
            Behavior = ProvisionBehavior.Default;
            Level = ProvisionLevel.Default;
        }

        public FieldAttribute(string name) : this(name, FieldType.Text)
        {
        }

        public FieldAttribute(string name, FieldType dataType) : this()
        {
            Name = name;
            DataType = dataType;
        }

        public virtual string Title { get; set; }

        public virtual string Name { get; set; }

        public virtual bool Required { get; set; }

        public virtual bool IsReadOnly { get; set; }

        public virtual FieldType DataType { get; set; }

        public virtual string Group { get; set; }

        public int Order { get; set; }

        [Obsolete("Use ProvisionBehavior.Overwrite instead.")]
        public bool Overwrite
        {
            get
            {
                return Behavior == ProvisionBehavior.Overwrite;
            }
            set
            {
                Behavior = ProvisionBehavior.Overwrite;
            }
        }

        public ProvisionBehavior Behavior { get; set; }
        public ProvisionLevel Level { get; set; }

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
