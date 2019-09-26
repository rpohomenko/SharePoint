using System.Xml.Linq;

namespace SP.Client.Caml.Interfaces
{
    public interface ICaml
    {
        string ElementName { get; }
        XElement ToXElement();
    }
}