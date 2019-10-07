using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using SP.Client.Extensions;

namespace SP.Client.Linq.Provisioning
{
    public sealed class FieldProvisionHandler<TContext, TEntity> : SpProvisionHandler<TContext, TEntity>
        where TContext : class, ISpEntryDataContext
        where TEntity : class, IListItemEntity
    {
        private readonly Type _valueType;

        public FieldAttribute Field { get; }

        public ContentTypeAttribute ContentType { get; }

        public ListAttribute List { get; }


        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioning;

        public event Action<FieldProvisionHandler<TContext, TEntity>, Field> OnProvisioned;

        public FieldProvisionHandler(FieldAttribute field, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, null, list, model, valueType)
        {
        }

        public FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, SpProvisionModel<TContext, TEntity> model, Type valueType) : this(field, contentType, null, model, valueType)
        {
        }

        public FieldProvisionHandler(FieldAttribute field, ContentTypeAttribute contentType, ListAttribute list, SpProvisionModel<TContext, TEntity> model, Type valueType) : base(model)
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

        public override void Provision(bool overwrite)
        {
            if (Field != null && Model != null && Model.Context != null && Model.Context.Context != null)
            {
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

                var fields = list != null ? list.Fields : (ContentType != null ? web.Fields : null);
                if (fields == null) return;

                field = list != null ? fields.GetByInternalNameOrTitle(Field.Name) : web.AvailableFields.GetByInternalNameOrTitle(Field.Name);
                try
                {
                    context.Load(field);
                    context.ExecuteQuery();
                    if (((overwrite && field.Group == Field.Group) || Field.Overwrite) && field.CanBeDeleted && !field.Sealed)
                    {
                        field.DeleteObject();
                        try
                        {
                            context.ExecuteQuery();
                            field = null;
                        }
                        catch
                        {
                            return;
                        }
                    }
                }
                catch (Exception ex)
                {
                    field = null;
                }

                if (field == null)
                {
                    if (Field.DataType == FieldType.ContentTypeId
                        || Field.DataType == FieldType.Counter
                        || Field.DataType == FieldType.Computed
                        || Field.DataType == FieldType.File)
                    {
                        return;
                    }
                    if (Field.DataType == FieldType.Calculated)
                    {
                        if (typeof(CalculatedFieldAttribute).IsAssignableFrom(Field.GetType()))
                        {
                            string fieldRefs = (Field as CalculatedFieldAttribute).FieldRefs == null
                                ? null
                                : string.Join("", (Field as CalculatedFieldAttribute).FieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToString()));
                            string formula = (Field as CalculatedFieldAttribute).Formula;

                            if (!string.IsNullOrEmpty(fieldRefs) && formula != null)
                            {
                                var refFields = new List<Field>();
                                foreach (string fieldName in (Field as CalculatedFieldAttribute).FieldRefs)
                                {
                                    var refField = fields.GetByInternalNameOrTitle(fieldName);
                                    context.Load(refField, f => f.Title, f => f.InternalName, f => f.Id);
                                    refFields.Add(refField);
                                }
                                context.ExecuteQuery();
                                foreach (Field refField in refFields)
                                {
                                    formula = formula.Replace($"[{refField.InternalName}]", $"[{refField.Title}]");
                                }
                            }

                            string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' ResultType='{{2}}'><Formula>{{0}}</Formula><FieldRefs>{{1}}</FieldRefs></Field>";
                            fieldXml = string.Format(fieldXml, System.Security.SecurityElement.Escape(formula), fieldRefs, (Field as CalculatedFieldAttribute).ResultType);
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = Field.DataType;
                            field.ReadOnlyField = Field.IsReadOnly;
                            if (!string.IsNullOrEmpty(Field.Group)) field.Group = Field.Group;

                            var calculatedField = context.CastTo<FieldCalculated>(field);
                            calculatedField.OutputType = (Field as CalculatedFieldAttribute).ResultType;
                            calculatedField.Formula = formula;
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

                                string fieldXml = allowMultipleValues
                                    ? $"<Field Type='LookupMulti' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' Mult='TRUE' />"
                                    : $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";

                                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                                field.FieldTypeKind = Field.DataType;
                                field.Required = Field.Required;
                                field.ReadOnlyField = Field.IsReadOnly;
                                if (!string.IsNullOrEmpty(Field.Group)) field.Group = Field.Group;

                                var lookupField = context.CastTo<FieldLookup>(field);
                                lookupField.AllowMultipleValues = allowMultipleValues;

                                Type lookupEntityType = _valueType.GenericTypeArguments.FirstOrDefault();
                                var lookupList = GetLookupList(lookupEntityType);
                                if (lookupList != null)
                                {
                                    lookupField.LookupList = lookupList.Id.ToString();
                                    lookupField.LookupField = "Title";
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
                            string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = Field.DataType;
                            field.Required = Field.Required;
                            field.ReadOnlyField = Field.IsReadOnly;
                            if (!string.IsNullOrEmpty(Field.Group)) field.Group = Field.Group;

                            var choiceField = context.CastTo<FieldChoice>(field);
                            var choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(_valueType).Select(choice => choice.Value);
                            choiceField.Choices = choices.OrderBy(choice => choice.Index).Select(choice => choice.Value).ToArray();

                            OnProvisioning?.Invoke(this, choiceField);
                        }
                        else
                        {
                            string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                            field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                            field.FieldTypeKind = Field.DataType;
                            field.Required = Field.Required;
                            field.ReadOnlyField = Field.IsReadOnly;
                            if (!string.IsNullOrEmpty(Field.Group)) field.Group = Field.Group;

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
    }
}

