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

    internal Field ApplyField(Field field)
    {
      if (field == null || Field == null) return field;
      if (!field.IsPropertyAvailable("FieldTypeKind") || field.FieldTypeKind != Field.DataType)
      {
        field.FieldTypeKind = Field.DataType;
      }
      if (!field.IsPropertyAvailable("Title") || field.Title != Field.Title)
      {
        field.Title = Field.Title;
      }
      if (!field.IsPropertyAvailable("Required") || field.Required != Field.Required)
      {
        field.Required = Field.Required;
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
      if (!field.IsPropertyAvailable("Indexed") || field.Indexed != Field.Indexed)
      {
        field.Indexed = Field.Indexed;
      }
      if (!field.IsPropertyAvailable("Hidden") || field.Hidden != Field.Hidden)
      {
        field.Hidden = Field.Hidden;
      }
      if (!field.IsPropertyAvailable("Description") || field.Description != Field.Description)
      {
        if (!string.IsNullOrEmpty(Field.Description))
        {
          field.Description = Field.Description;
        }
      }
      if (!field.IsPropertyAvailable("DefaultValue") || field.DefaultValue != Field.DefaultValue)
      {
        if (!string.IsNullOrEmpty(Field.DefaultValue))
        {
          field.DefaultValue = Field.DefaultValue;
        }
      }
      if (!field.IsPropertyAvailable("EnforceUniqueValues") || field.EnforceUniqueValues != Field.EnforceUniqueValues)
      {
        field.EnforceUniqueValues = Field.EnforceUniqueValues;
      }

      switch (Field.DataType)
      {
        case FieldType.Calculated:
          {
            FieldCalculated calculatedField = field.Context.CastTo<FieldCalculated>(field);

            if (typeof(CalculatedFieldAttribute).IsAssignableFrom(Field.GetType()))
            {
              if (!calculatedField.IsPropertyAvailable("OutputType") || calculatedField.OutputType != (Field as CalculatedFieldAttribute).ResultType)
              {
                calculatedField.OutputType = (Field as CalculatedFieldAttribute).ResultType;
              }
              if (!calculatedField.IsPropertyAvailable("Formula") || calculatedField.Formula != (Field as CalculatedFieldAttribute).Formula)
              {
                calculatedField.Formula = (Field as CalculatedFieldAttribute).Formula;
              }
            }
            return calculatedField;
          }
        case FieldType.Lookup:
          {
            bool allowMultipleValues = false;
            if (typeof(LookupFieldAttribute).IsAssignableFrom(Field.GetType()))
            {
              allowMultipleValues = (Field as LookupFieldAttribute).IsMultiple;
            }
            var lookupField = field.Context.CastTo<FieldLookup>(field);
            if (!lookupField.IsPropertyAvailable("AllowMultipleValues") || lookupField.AllowMultipleValues != allowMultipleValues)
            {
              lookupField.AllowMultipleValues = allowMultipleValues;
            }
            Type lookupEntityType = null;
            if (_valueType != null && typeof(ISpEntityLookup).IsAssignableFrom(_valueType) || typeof(ISpEntityLookupCollection).IsAssignableFrom(_valueType))
            {
              lookupEntityType = _valueType.GenericTypeArguments.FirstOrDefault();
            }
            else if (typeof(IListItemEntity).IsAssignableFrom(_valueType))
            {
              lookupEntityType = _valueType;
            }
            if (lookupEntityType != null)
            {
              var lookupList = GetLookupList(lookupEntityType);
              if (lookupList != null)
              {
                if (!lookupField.IsPropertyAvailable("LookupList"))
                {
                  lookupField.LookupList = lookupList.Id.ToString();
                  lookupField.LookupField = "Title";
                }
                else
                {
                  lookupField.ReplaceLookupAttributes(lookupField.IsPropertyAvailable("LookupWebId") ? lookupField.LookupWebId : Guid.Empty, lookupList.Id, "Title");
                }
              }
            }
            return lookupField;
          }

        case FieldType.Choice:
        case FieldType.MultiChoice:
          {
            string[] choices = null;
            if (_valueType.IsEnum)
            {
              choices = AttributeHelper.GetFieldAttributes<ChoiceAttribute>(_valueType).Select(choice => choice.Value)
                    .OrderBy(choice => choice.Index).Select(choice => choice.Value).ToArray();
            }
            bool isMultiple = false;
            if (Field is ChoiceFieldAttribute)
            {
              if ((Field as ChoiceFieldAttribute).IsMultiple)
              {
                isMultiple = true;
                var multiChoiceField = field.Context.CastTo<FieldMultiChoice>(field);
                if (!multiChoiceField.IsPropertyAvailable("Choices") || !multiChoiceField.Choices.SequenceEqual(choices))
                {
                  multiChoiceField.Choices = choices;
                }
                return multiChoiceField;
              }
            }
            if (!isMultiple)
            {
              var choiceField = field.Context.CastTo<FieldChoice>(field);
              if (!choiceField.IsPropertyAvailable("Choices") || !choiceField.Choices.SequenceEqual(choices))
              {
                choiceField.Choices = choices;
              }
              return choiceField;
            }
            return field;
          }
        case FieldType.Note:
          {
            var noteField = field.Context.CastTo<FieldMultiLineText>(field);
            if (Field is NoteFieldAttribute)
            {
              if (!noteField.IsPropertyAvailable("AllowHyperlink") || noteField.AllowHyperlink != (Field as NoteFieldAttribute).AllowHyperlink)
              {
                noteField.AllowHyperlink = (Field as NoteFieldAttribute).AllowHyperlink;
              }
              if (!noteField.IsPropertyAvailable("AppendOnly") || noteField.AppendOnly != (Field as NoteFieldAttribute).AppendOnly)
              {
                noteField.AppendOnly = (Field as NoteFieldAttribute).AppendOnly;
              }
              if (!noteField.IsPropertyAvailable("NumberOfLines") || noteField.NumberOfLines != (Field as NoteFieldAttribute).NumberOfLines)
              {
                if ((Field as NoteFieldAttribute).NumberOfLines > 0)
                {
                  noteField.NumberOfLines = (Field as NoteFieldAttribute).NumberOfLines;
                }
              }
              if (!noteField.IsPropertyAvailable("RestrictedMode") || noteField.RestrictedMode != (Field as NoteFieldAttribute).RestrictedMode)
              {
                noteField.RestrictedMode = (Field as NoteFieldAttribute).RestrictedMode;
              }
              if (!noteField.IsPropertyAvailable("RichText") || noteField.RichText != (Field as NoteFieldAttribute).RichText)
              {
                noteField.RichText = (Field as NoteFieldAttribute).RichText;
              }
#if !SP2013 && !SP2016
              if (!noteField.IsPropertyAvailable("UnlimitedLengthInDocumentLibrary") || noteField.UnlimitedLengthInDocumentLibrary != (Field as NoteFieldAttribute).UnlimitedLengthInDocumentLibrary)
              {
                noteField.UnlimitedLengthInDocumentLibrary = (Field as NoteFieldAttribute).UnlimitedLengthInDocumentLibrary;
              }
#endif
            }
            return noteField;
          }
        case FieldType.Text:
          var textField = field.Context.CastTo<FieldText>(field);
          if (Field is TextFieldAttribute)
          {
            if (!textField.IsPropertyAvailable("MaxLength") || textField.MaxLength != (Field as TextFieldAttribute).MaxLength)
            {
              if ((Field as TextFieldAttribute).MaxLength > 0)
              {
                textField.MaxLength = (Field as TextFieldAttribute).MaxLength;
              }
            }
          }
          return textField;
      }
      return field;
    }

    public override void Provision(bool forceOverwrite, ProvisionLevel level)
    {
      if (Field != null && Model != null && Model.Context != null && Model.Context.Context != null)
      {
        if (Field.Behavior == ProvisionBehavior.None) return;

        if (level != ProvisionLevel.Default)
        {
          //Field.Level = level;
        }
        else if (Field.Level == ProvisionLevel.Default)
        {
          if (ContentType != null)
          {
            level = ContentType.Level;
          }
          if (level == ProvisionLevel.Default)
          {
            level = List != null && List.Behavior != ProvisionBehavior.None ? ProvisionLevel.List : ProvisionLevel.Web;
          }
        }

        if (Field.Behavior == ProvisionBehavior.Default)
        {
          if (level == ProvisionLevel.List)
          {
            if (List != null)
            {
              Field.Behavior = List.Behavior;
            }
          }
          if (Field.Behavior == ProvisionBehavior.Default && ContentType != null)
          {
            Field.Behavior = ContentType.Behavior;
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
        catch (Exception)
        {
          field = null;
        }

        if (level == ProvisionLevel.List && list != null)
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
            string formula = null;
            string fieldRefs = null;
            string newFormula = null;

            if (typeof(CalculatedFieldAttribute).IsAssignableFrom(Field.GetType()))
            {
              fieldRefs = (Field as CalculatedFieldAttribute).FieldRefs == null
                  ? null
                  : string.Join("", (Field as CalculatedFieldAttribute).FieldRefs.Select(fieldRef => new Caml.CamlFieldRef() { Name = fieldRef }.ToString()));
              formula = (Field as CalculatedFieldAttribute).Formula;

              if (!string.IsNullOrEmpty(fieldRefs) && !string.IsNullOrEmpty(formula))
              {
                if (level == ProvisionLevel.List)
                {
                  var refFields = new List<Field>();
                  foreach (string fieldName in (Field as CalculatedFieldAttribute).FieldRefs)
                  {
                    var refField = (level == ProvisionLevel.Web ? web.AvailableFields : fields).GetByInternalNameOrTitle(fieldName);
                    context.Load(refField, f => f.Title, f => f.InternalName, f => f.Id);
                    refFields.Add(refField);
                  }
                  context.ExecuteQuery();
                  foreach (Field refField in refFields)
                  {
                    newFormula = formula.Replace($"[{refField.InternalName}]", $"[{refField.Title}]");
                  }
                }
              }
            }
            if (field == null)
            {
              string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' ResultType='{{2}}'><Formula>{{0}}</Formula><FieldRefs>{{1}}</FieldRefs></Field>";
              fieldXml = string.Format(fieldXml, System.Security.SecurityElement.Escape(newFormula), fieldRefs, (Field as CalculatedFieldAttribute).ResultType);

              field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
            }

            if (Field is CalculatedFieldAttribute)
            {
              (Field as CalculatedFieldAttribute).Formula = newFormula;
            }

            field = ApplyField(field);

            if (Field is CalculatedFieldAttribute)
            {
              (Field as CalculatedFieldAttribute).Formula = formula;
            }

            OnProvisioning?.Invoke(this, field);
          }
          else
          {
            if (Field.DataType == FieldType.Lookup)
            {
              if (_valueType != null &&
                (typeof(ISpEntityLookup).IsAssignableFrom(_valueType) || typeof(ISpEntityLookupCollection).IsAssignableFrom(_valueType))
                || typeof(IListItemEntity).IsAssignableFrom(_valueType))
              {
                bool allowMultipleValues = false;
                if (typeof(LookupFieldAttribute).IsAssignableFrom(Field.GetType()))
                {
                  allowMultipleValues = (Field as LookupFieldAttribute).IsMultiple;
                }
                if (field == null)
                {
                  string fieldXml = allowMultipleValues
                    ? $"<Field Type='LookupMulti' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' Mult='TRUE' />"
                    : $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                  field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
                }
                field = ApplyField(field);
                OnProvisioning?.Invoke(this, field);
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

              field = ApplyField(field);
              OnProvisioning?.Invoke(this, field);
            }
            else if (Field.DataType == FieldType.Note)
            {
              if (field == null)
              {
                string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' RichText='{(Field is NoteFieldAttribute && (Field as NoteFieldAttribute).RichText ? "TRUE" : "FALSE")}' RichTextMode='{(Field is NoteFieldAttribute && (Field as NoteFieldAttribute).RichText ? "FullHtml" : "Compatible")}' IsolateStyles='{(Field is NoteFieldAttribute && (Field as NoteFieldAttribute).RichText ? "TRUE" : "FALSE")}' />";
                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
              }
              field = ApplyField(field);
              OnProvisioning?.Invoke(this, field);
            }
            else
            {
              if (field == null)
              {
                string fieldXml = $"<Field Type='{Field.DataType}' Name='{Field.Name}' StaticName='{Field.Name}' DisplayName='{Field.Title ?? Field.Name}' />";
                field = fields.AddFieldAsXml(fieldXml, true, AddFieldOptions.AddFieldInternalNameHint);
              }
              field = ApplyField(field);
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

    public override void UnProvision(ProvisionLevel level)
    {
      if (Field != null && Model != null && Model.Context != null && Model.Context.Context != null)
      {
        if (Field.Behavior == ProvisionBehavior.None) return;

        if (level != ProvisionLevel.Default)
        {
          //Field.Level = level;
        }
        else
        {
          level = Field.Level;
          if (level == ProvisionLevel.Default)
          {
            if (ContentType != null)
            {
              level = ContentType.Level;
            }
            if (level == ProvisionLevel.Default)
            {
              level = List != null ? ProvisionLevel.List : ProvisionLevel.Web;
            }
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

        bool deleted = false;
        if (level == ProvisionLevel.Web)
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

