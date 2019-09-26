using System.Collections.Generic;

namespace SP.Client.Caml.Interfaces
{
    public interface ICamlMultiField : ICaml
    {
        IEnumerable<CamlFieldRef> FieldRefs { get; }
    }
}