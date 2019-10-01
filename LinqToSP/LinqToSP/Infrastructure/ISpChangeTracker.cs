using SP.Client.Linq.Attributes;
using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTracker
    {
        bool DetectChanges(FieldAttribute field, object originalValue, ref object currentValue);
    }
}
