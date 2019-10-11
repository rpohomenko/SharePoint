using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using SP.Client.Extensions;
using System.Xml.Linq;

namespace SP.Client.Linq.Provisioning
{
    public sealed class FieldProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity, new()
    {
        private readonly Type _valueType;

        public FieldAttribute Field { get; }

        public ContentTypeAttribute ContentType { get; }

        public ListAttribute List { get; }


        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioning;

        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioned;

        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnUnProvisioning;

        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnUnProvisioned;

        internal FieldProvisionHandler(FieldAttribute field, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, null, list, model, valueType)
        {
        }

        internal FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, contentType, null, model, valueType)
        {
        }

        internal FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : base(model)
        {
            Field = field;
            ContentType = contentType;
            List = list;
            _valueType = valueType;
        }

        private List GetLookupList(Type lookupEntityType)
        {
            var lookupList = AttributeHelper.GetCustomAttributes<ListAttribute>(lookupEntityType, false).FirstOrDefault();
            if (lookupList != null)
            {
                var context = Model.Context.Context;
                List list = !string.IsNullOrEmpty(lookupList.Url)
                        ? context.Web.GetList($"{ Model.Context.SiteUrl.TrimEnd('/')}/{lookupList.Url.TrimStart('/')}")
                        : (!string.IsNullOrEmpty(lookupList.Title) ? context.Web.Lists.GetByTitle(lookupList.Title) : null);

                if (list != null)
                {
                    context.Load(list);
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch
                    {
                        return null;
                    }
                }
                return list;
            }
            return null;
        }

        private static string ChangeLookupAttributes(string schemeXml, Guid webId, Guid listId, string fieldName)
        {
            var fieldScheme = XElement.Parse(schemeXml);
            XAttribute list = fieldScheme.Attribute("List");
            if (list != null) list.Value = listId.ToString();
            XAttribute web = fieldScheme.Attribute("WebId");
            if (web != null) web.Value = webId.ToString();
            XAttribute field = fieldScheme.Attribute("ShowField");
            if (field != null) field.Value = fieldName;
            return fieldScheme.ToString(SaveOptions.DisableFormatting);
        }

        private static string RemoveFormula(string schemeXml)
        {
            var fieldScheme = XElement.Parse(schemeXml);
            var formula = fieldScheme.Element("Formula");
            if (formula != null)
            {
                formula.Remove();
            }
            var fieldRefs = fieldScheme.Element("FieldRefs");
            if (fieldRefs != null)
            {
                fieldRefs.Remove();
            }
            return fieldScheme.ToString(SaveOptions.DisableFormatting);
        }

        public override void Provision(bool forceOverwrite)
        {
            if (Field != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                if (Field.Behavior == ProvisionBehavior.None) return;

                if (Field.Level == ProvisionLevel.Default)
                {
                    if (ContentType != null)
                    {
                        Field.Level = ContentType.Level;
                    }
                    if (Field.Level == ProvisionLevel.Default)
                    {
                        Field.Level = List != null ? ProvisionLevel.List : ProvisionLevel.Web;
                    }
                }

                if (Field.DataType == FieldType.ContentTypeId
                     || Field.DataType == FieldType.Counter
                     || Field.DataType == FieldType.Computed
                     || Field.DataType == FieldType.File)
                {
                    return;
                }

                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                Field field = null;
                if (List != null)
                {
                    if (List.Id != default)
                    {
                        list = context.Web.Lists.GetById(List.Id);
                    }
                    else if (List.Url != null)
                    {
                        list = context.Web.GetList($"{ new Uri(Model.Context.SiteUrl).LocalPath.TrimEnd('/')}/{List.Url.TrimStart('/')}");
                    }
                    else if (!string.IsNullOrEmpty(List.Title))
                    {
                        list = context.Web.Lists.GetByTitle(List.Title);
                    }
                    //if (list != null)
                    //{
                    //  context.Load(list);
                    //  try
                    //  {
                    //    context.ExecuteQuery();
                    //  }
                    //  catch (Exception ex)
                    //  {
                    //    list = null;
                    //  }
                    //}
                }

                FieldCollection fields = null;

                field = web.AvailableFields.GetByInternalNameOrTitle(Field.Name);
                fields = web.Fields;

                context.Load(field);
                try
                {
                    context.ExecuteQuery();
                }
                catch (Exception ex)
                {
                    field = null;
                }

                if (Field.Level == ProvisionLevel.List && list != null)
                {
                    Field existField = list.Fields.GetByInternalNameOrTitle(Field.Name);
                    context.Load(existField);
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch (Exception ex)
                    {
                        existField = null;
                    }
                    if (existField != null)
                    {
                        field = existField;
                    }
                    else
                    {
                        field = null;
                        //if (field != null)
                        //{
                        //    FieldType fieldType = field.FieldTypeKind;
                        //    string schemaXml = field.SchemaXml;

                        //    field = list.Fields.Add(field);

                        //    if (!forceOverwrite && Field.Behavior != ProvisionBehavior.Overwrite && field != null)
                        //    {
                        //        OnProvisioning?.Invoke(this, field);
                        //        field.Update();
                        //        context.Load(field);
                        //        context.ExecuteQuery();
                        //        OnProvisioned?.Invoke(this, field);
                        //        return;
                        //    }
                        //    else
                        //    {
                        //        if (fieldType == FieldType.Lookup)
                        //        {
                        //            field.SchemaXml = schemaXml;
                        //        }
                        //        else if (fieldType == FieldType.Calculated)
                        //        {
                        //            field.SchemaXml = RemoveFormula(schemaXml);
                        //        }
                        //    }
                        //}
                    }
                    fields = list.Fields;
                }

                if (!forceOverwrite /*&& !Field.Overwrite*/ && Field.Behavior != ProvisionBehavior.Overwrite && field != null)
                {
                    OnProvisioned?.Invoke(this, field);
                    return;
                }

                if (fields != null)
                {
                    if (Field.DataType == FieldType.Calculated)
                    {
                        if (typeof(CalculatedFieldAttribute).IsAssignableFrom(Field.GetType()))
                        {
                            string fieldRefs = (Field as CalculatedFieldAttribute).FieldRefs == null
                                ? null
                                : string.Join("", (Field as CalculatedFieldAttribute).FieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToString()));
                            string formula = (Field as CalculatedFieldAttribute).Formula;
                            FieldCalculated calculatedField;

                            if (!string.IsNullOrEmpty(fieldRefs) && !string.IsNullOrEmpty(formula))
                            {
                                // formula requires field.Title in List only :).
                                if (Field.Level == ProvisionLevel.List)
                                {
                                    var refFields = new List<Field>();
                                    foreach (string fieldName in (Field as CalculatedFieldAttribute).FieldRefs)
                                    {
                                        var refField = (Field.Level == ProvisionLevel.Web ? web.AvailableFields : fields).GetByInternalNameOrTitle(fieldName);
                                        context.Load(refField, f => f.Title, f => f.InternalName, f => f.Id);
                                        refFields.Add(refField);
                                    }
                                    context.ExecuteQuery();
                                    foreach (Field refField in refFields)
                                    {
                                        formula = formula.Replace($"[{refField.InternalName}]", $"[{refField.Title}]");
                                    }
                                }
                            }

                            if (field == null)
                            {
                                string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' ResultType='{{2}}'><Formula>{{0}}</Formula><FieldRefs>{{1}}</FieldRefs></Field>";
                                fieldXml = string.Format(fieldXml, System.Security.SecurityElement.Escape(formula), fieldRefs, (Field as CalculatedFieldAttribute).ResultType);

                                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            }
                            else
                            {
                                if (!field.IsPropertyAvailable("FieldTypeKind") || field.FieldTypeKind != Field.DataType)
                                {
                                    field.FieldTypeKind = Field.DataType;
                                }
                            }
                            if (!field.IsPropertyAvailable("ReadOnlyField") || field.ReadOnlyField != Field.IsReadOnly)
                            {
                                field.ReadOnlyField = Field.IsReadOnly;
                            }
                            if (!field.IsPropertyAvailable("Group") || field.Group != Field.Group)
                            {
                                if (!string.IsNullOrEmpty(Field.Group))
                                {
                                    field.Group = Field.Group;
                                }
                            }

                            calculatedField = context.CastTo<FieldCalculated>(field);
                            if (!calculatedField.IsPropertyAvailable("OutputType") || calculatedField.OutputType != (Field as CalculatedFieldAttribute).ResultType)
                            {
                                calculatedField.OutputType = (Field as CalculatedFieldAttribute).ResultType;
                            }
                            if (!calculatedField.IsPropertyAvailable("Formula") || calculatedField.Formula != formula)
                            {
                                calculatedField.Formula = formula;
                            }
                            OnProvisioning?.Invoke(this, calculatedField);
                        }
                    }
                    else
                    {
                        if (Field.DataType == FieldType.Lookup)
                        {
                            if (_valueType != null && typeof(ISpEntityLookup).IsAssignableFrom(_valueType) || typeof(ISpEntityLookupCollection).IsAssignableFrom(_valueType))
                            {
                                bool allowMultipleValues = false;
                                if (typeof(LookupFieldAttribute).IsAssignableFrom(Field.GetType()))
                                {
                                    allowMultipleValues = (Field as LookupFieldAttribute).IsMultiple;
                                }
                                bool isNew = false;
                                if (field == null)
                                {
                                    isNew = true;
                                    string fieldXml = allowMultipleValues
                                      ? $"<Field Type='LookupMulti' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' Mult='TRUE' />"
                                      : $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                                    field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                                }
                                else
                                {
                                    if (!field.IsPropertyAvailable("FieldTypeKind") || field.FieldTypeKind != Field.DataType)
                                    {
                                        field.FieldTypeKind = Field.DataType;
                                    }
                                }
                                if (!field.IsPropertyAvailable("ReadOnlyField") || field.ReadOnlyField != Field.IsReadOnly)
                                {
                                    field.ReadOnlyField = Field.IsReadOnly;
                                }
                                if (!field.IsPropertyAvailable("Group") || field.Group != Field.Group)
                                {
                                    if (!string.IsNullOrEmpty(Field.Group))
                                    {
                                        field.Group = Field.Group;
                                    }
                                }

                                var lookupField = context.CastTo<FieldLookup>(field);
                                if (!lookupField.IsPropertyAvailable("AllowMultipleValues") || lookupField.AllowMultipleValues != allowMultipleValues)
                                {
                                    lookupField.AllowMultipleValues = allowMultipleValues;
                                }

                                Type lookupEntityType = _valueType.GenericTypeArguments.FirstOrDefault();
                                if (lookupEntityType != null)
                                {
                                    var lookupList = GetLookupList(lookupEntityType);
                                    if (lookupList != null)
                                    {
                                        if (isNew)
                                        {
                                            lookupField.LookupList = lookupList.Id.ToString();
                                            lookupField.LookupField = "Title";
                                        }
                                        else
                                        {
                                            if (lookupField.IsPropertyAvailable("SchemaXml"))
                                            {
                                                string schemaXml = ChangeLookupAttributes(lookupField.SchemaXml, lookupField.IsPropertyAvailable("LookupWebId") ? lookupField.LookupWebId : Guid.Empty, lookupList.Id, "Title");
                                                if (lookupField.SchemaXml != schemaXml)
                                                {
                                                    lookupField.SchemaXml = schemaXml;
                                                }
                                            }
                                        }
                                    }
                                }

                                OnProvisioning?.Invoke(this, lookupField);
                            }
                            else
                            {
                                field = null;
                            }
                        }
                        else if ((Field.DataType == FieldType.Choice || Field.DataType == FieldType.MultiChoice) && _valueType.IsEnum)
                        {
                            if (field == null)
                            {
                                string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            }
                            else
                            {
                                if (!field.IsPropertyAvailable("FieldTypeKind") || field.FieldTypeKind != Field.DataType)
                                {
                                    field.FieldTypeKind = Field.DataType;
                                }
                            }
                            if (!field.IsPropertyAvailable("ReadOnlyField") || field.ReadOnlyField != Field.IsReadOnly)
                            {
                                field.ReadOnlyField = Field.IsReadOnly;
                            }
                            if (!field.IsPropertyAvailable("Group") || field.Group != Field.Group)
                            {
                                if (!string.IsNullOrEmpty(Field.Group))
                                {
                                    field.Group = Field.Group;
                                }
                            }

                            var choiceField = context.CastTo<FieldChoice>(field);
                            var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(_valueType).Select(choice => choice.Value)
                                .OrderBy(choice => choice.Index).Select(choice => choice.Value).ToArray();
                            if (!choiceField.IsPropertyAvailable("Choices") || !choiceField.Choices.SequenceEqual(choices))
                            {
                                choiceField.Choices = choices;
                            }

                            OnProvisioning?.Invoke(this, choiceField);
                        }
                        else
                        {
                            if (field == null)
                            {
                                string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            }
                            else
                            {
                                if (!field.IsPropertyAvailable("FieldTypeKind") || field.FieldTypeKind != Field.DataType)
                                {
                                    field.FieldTypeKind = Field.DataType;
                                }
                            }
                            if (!field.IsPropertyAvailable("ReadOnlyField") || field.ReadOnlyField != Field.IsReadOnly)
                            {
                                field.ReadOnlyField = Field.IsReadOnly;
                            }
                            if (!field.IsPropertyAvailable("Group") || field.Group != Field.Group)
                            {
                                if (!string.IsNullOrEmpty(Field.Group))
                                {
                                    field.Group = Field.Group;
                                }
                            }

                            OnProvisioning?.Invoke(this, field);
                        }
                    }
                    if (field != null)
                    {
                        field.Update();
                        context.Load(field);
                        context.ExecuteQuery();

                        OnProvisioned?.Invoke(this, field);
                    }
                }
            }
        }

        public override void UnProvision()
        {
            if (Field != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
                if (Field.Behavior == ProvisionBehavior.None) return;

                if (Field.Level == ProvisionLevel.Default)
                {
                    if (ContentType != null)
                    {
                        Field.Level = ContentType.Level;
                    }
                    if (Field.Level == ProvisionLevel.Default)
                    {
                        Field.Level = List != null ? ProvisionLevel.List : ProvisionLevel.Web;
                    }
                }

                if (Field.DataType == FieldType.ContentTypeId
                     || Field.DataType == FieldType.Counter
                     //|| Field.DataType == FieldType.Computed
                     || Field.DataType == FieldType.File)
                {
                    return;
                }

                var context = Model.Context.Context;
                Web web = context.Web;
                List list = null;
                Field field = null;
                if (List != null)
                {
                    if (List.Id != default)
                    {
                        list = context.Web.Lists.GetById(List.Id);
                    }
                    else if (List.Url != null)
                    {
                        list = context.Web.GetList/*ByUrl*/($"{ new Uri(Model.Context.SiteUrl).LocalPath.TrimEnd('/')}/{List.Url.TrimStart('/')}");
                    }
                    else if (!string.IsNullOrEmpty(List.Title))
                    {
                        list = context.Web.Lists.GetByTitle(List.Title);
                    }
                    //if (list != null)
                    //{
                    //  context.Load(list);
                    //  try
                    //  {
                    //    context.ExecuteQuery();
                    //  }
                    //  catch (Exception ex)
                    //  {
                    //    list = null;
                    //  }
                    //}
                }

                bool deleted = false;
                if (Field.Level == ProvisionLevel.Web)
                {
                    field = web.Fields.GetByInternalNameOrTitle(Field.Name);

                    context.Load(field);
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch (Exception ex)
                    {
                        field = null;
                    }
                    if (field != null && list == null)
                    {
                        if (field.CanBeDeleted)
                        {
                            field.DeleteObject();
                            OnUnProvisioning?.Invoke(this, field);
                            deleted = true;
                        }
                    }
                }
                if (list != null)
                {
                    Field existField = list.Fields.GetByInternalNameOrTitle(Field.Name);
                    context.Load(existField);
                    try
                    {
                        context.ExecuteQuery();
                    }
                    catch (Exception ex)
                    {
                        existField = null;
                    }
                    if (existField != null)
                    {
                        if (existField.CanBeDeleted)
                        {
                            existField.DeleteObject();
                            OnUnProvisioning?.Invoke(this, field);
                            deleted = true;
                        }
                    }
                    if (field != null)
                    {
                        if (field.CanBeDeleted)
                        {
                            field.DeleteObject();
                            OnUnProvisioning?.Invoke(this, field);
                            deleted = true;
                        }
                    }
                    else
                    {
                        field = existField;
                    }
                }

                if (deleted)
                {
                    context.ExecuteQuery();
                    OnUnProvisioned?.Invoke(this, field);
                }
            }
        }
    }
}

