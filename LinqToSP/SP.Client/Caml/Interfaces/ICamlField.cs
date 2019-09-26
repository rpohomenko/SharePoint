namespace SP.Client.Caml.Interfaces
{
    public interface ICamlField : ICaml
    {
        CamlFieldRef FieldRef { get; }
    }
}