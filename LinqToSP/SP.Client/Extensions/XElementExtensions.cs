using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Extensions
{
    public static class XElementExtensions
    {
        /// <summary>Gets the first (in document order) child element with the specified <see cref="XName" />.</summary>
        /// <param name="element">The element.</param>
        /// <param name="name">The <see cref="XName" /> to match.</param>
        /// <returns>A <see cref="XElement" /> that matches the specified <see cref="XName" />, or null. </returns>
        public static XElement ElementIgnoreCase(this XElement element, XName name)
        {
            return element.Elements().FirstOrDefault(e => e.Name.NamespaceName == name.NamespaceName &&
                                                          string.Equals(e.Name.LocalName, name.LocalName,
                                                              StringComparison.OrdinalIgnoreCase));
        }

        public static IEnumerable<XElement> ElementsIgnoreCase(this XContainer container, XName name)
        {
            return container.Elements().Where(element => element.Name.NamespaceName == name.NamespaceName &&
                                                         string.Equals(element.Name.LocalName, name.LocalName,
                                                             StringComparison.OrdinalIgnoreCase));
        }

        public static XAttribute AttributeIgnoreCase(this XElement element, XName name)
        {
            return element.Attributes().FirstOrDefault(attr => attr.Name.NamespaceName == name.NamespaceName &&
                                                               string.Equals(attr.Name.LocalName, name.LocalName,
                                                                   StringComparison.OrdinalIgnoreCase));
        }

        public static IEnumerable<XAttribute> AttributesIgnoreCase(this XElement element, XName name)
        {
            return element.Attributes().Where(attr => attr.Name.NamespaceName == name.NamespaceName &&
                                                      string.Equals(attr.Name.LocalName, name.LocalName,
                                                          StringComparison.OrdinalIgnoreCase));
        }
    }
}