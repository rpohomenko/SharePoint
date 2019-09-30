using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTracker
    {
        bool DetectChanges(Dictionary<string, object> originalValues);
    }
}
