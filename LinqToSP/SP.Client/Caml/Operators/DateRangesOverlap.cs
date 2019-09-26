using System;
using System.Xml.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Caml.Operators
{
    public class DateRangesOverlap : ValueMultiFieldOperator<object>
    {
        internal const string DateRangesOverlapTag = "DateRangesOverlap";

        public DateRangesOverlap(CamlFieldRef startField, CamlFieldRef endField, CamlFieldRef recurrenceIdField,
            CamlValue.DateCamlValue value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(string startField, string endField, string recurrenceIdField,
            CamlValue.DateCamlValue value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(Guid startField, Guid endField, Guid recurrenceIdField, CamlValue.DateCamlValue value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(CamlFieldRef startField, CamlFieldRef endField, CamlFieldRef recurrenceIdField,
            DateTime value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(string startField, string endField, string recurrenceIdField, DateTime value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(Guid startField, Guid endField, Guid recurrenceIdField, DateTime value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(CamlFieldRef startField, CamlFieldRef endField, CamlFieldRef recurrenceIdField,
           CamlValue<DateTime> value)
           : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(string startField, string endField, string recurrenceIdField, CamlValue<DateTime> value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(Guid startField, Guid endField, Guid recurrenceIdField, CamlValue<DateTime> value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(CamlFieldRef startField, CamlFieldRef endField, CamlFieldRef recurrenceIdField,
           CamlValue value)
           : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(string startField, string endField, string recurrenceIdField, CamlValue value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }

        public DateRangesOverlap(Guid startField, Guid endField, Guid recurrenceIdField, CamlValue value)
            : base(DateRangesOverlapTag, new[] { startField, endField, recurrenceIdField }, value, FieldType.DateTime)
        {
        }


        public DateRangesOverlap(string existingSingleFieldValueOperator)
            : base(DateRangesOverlapTag, existingSingleFieldValueOperator)
        {
        }

        public DateRangesOverlap(XElement existingSingleFieldValueOperator)
            : base(DateRangesOverlapTag, existingSingleFieldValueOperator)
        {
        }
    }
}