using System.Collections.Generic;

namespace SP.Client.Caml.Interfaces
{
    internal interface ICamlMultiValue<T> : ICaml
    {
        IEnumerable<CamlValue<T>> Values { get; }
    }
}