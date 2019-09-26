using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Interfaces
{
    public interface ICamlSpecialValue : ICaml
    {
        bool IsSupported(FieldType fieldType);
    }
}