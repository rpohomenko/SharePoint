using SP.Client.Linq.Attributes;
using System.ComponentModel;
using System.Reflection;

namespace SP.Client.Linq.Infrastructure
{
    public interface ISpChangeTracker: INotifyPropertyChanging, INotifyPropertyChanged
    {
        bool DetectChanges(MemberInfo member, FieldAttribute field, object originalValue, ref object currentValue);
    }
}
