namespace SP.Client.Caml.Interfaces
{
    internal interface ICamlValue<T> : ICaml
    {
        CamlValue<T> Value { get; }
    }
}