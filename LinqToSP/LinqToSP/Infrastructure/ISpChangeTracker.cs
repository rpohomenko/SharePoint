using SP.Client.Linq.Attributes;
using System.ComponentModel;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTracker: INotifyPropertyChanging, INotifyPropertyChanged
    {
        bool DetectChanges(FieldAttribute field, object originalValue, ref object currentValue);
    }
}
