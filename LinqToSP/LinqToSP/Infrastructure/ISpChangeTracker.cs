using System.Collections.Generic;

namespace SP.Client.Linq.Infrastructure
{
  public interface ISpChangeTracker
  {
    Dictionary<string, object> DetectChanges(Dictionary<string, object> originalValues, Dictionary<string, object> currentValues);
  }
}
