using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTracker
    {
        bool DetectChanges(string fieldName, object originalValue, ref object currentValue);
    }
}
