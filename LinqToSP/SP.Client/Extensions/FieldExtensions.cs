using Microsoft.SharePoint.Client;
using System;
using System.Linq;
using System.Xml.Linq;

namespace SP.Client.Extensions
{
  public static class FieldExtensions
  {
    public static void ReplaceFormula(this Field field, string formula, string[] fieldRefs = null)
    {
      if (field != null && field.IsPropertyAvailable("SchemaXml"))
      {
        string schemaXml = field.SchemaXml;
        var fieldScheme = XElement.Parse(schemaXml);
        var formulaXml = fieldScheme.Element("Formula");
        if (formulaXml == null)
        {
          formulaXml = new XElement("Formula");
          fieldScheme.Add(formulaXml);
        }

        formulaXml.ReplaceAll(formula);

        var fieldRefsXml = fieldScheme.Element("FieldRefs");
        if (fieldRefsXml == null)
        {
          fieldRefsXml = new XElement("FieldRefs");
          fieldScheme.Add(fieldRefsXml);
        }
        if (fieldRefs == null)
        {
          fieldRefsXml.RemoveAll();
        }
        else
        {
          fieldRefsXml.ReplaceAll(fieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToXElement()));
        }
        schemaXml = fieldScheme.ToString(SaveOptions.DisableFormatting);
        if (field.SchemaXml != schemaXml)
        {
          field.SchemaXml = schemaXml;
        }
      }
    }

    public static void ReplaceLookupAttributes(this Field field, Guid webId, Guid listId, string showField)
    {
      if (field != null && field.IsPropertyAvailable("SchemaXml"))
      {
        string schemaXml = field.SchemaXml;
        var fieldScheme = XElement.Parse(schemaXml);
        XAttribute listAtt = fieldScheme.Attribute("List");
        if (listAtt != null) listAtt.Value = listId.ToString();
        XAttribute webAtt = fieldScheme.Attribute("WebId");
        if (webAtt != null) webAtt.Value = webId.ToString();
        XAttribute fieldAtt = fieldScheme.Attribute("ShowField");
        if (fieldAtt != null) fieldAtt.Value = showField;
        schemaXml = fieldScheme.ToString(SaveOptions.DisableFormatting);
        if (field.SchemaXml != schemaXml)
        {
          field.SchemaXml = schemaXml;
        }
      }
    }

  }
}
