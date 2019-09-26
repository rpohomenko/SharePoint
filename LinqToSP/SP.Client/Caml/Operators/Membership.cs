using SP.Client.Extensions;
using System;
using System.Xml.Linq;

namespace SP.Client.Caml.Operators
{
    public enum MembershipType
    {
        AllUsers,
        Group,
        Groups,
        CurrentUserGroups,
        WebUsers
    }

    public sealed class Membership : FieldOperator
    {
        internal const string MembershipTag = "Membership";
        internal const string TypeAttr = "Type";

        public Membership(CamlFieldRef fieldRef, MembershipType membershipType)
            : base(MembershipTag, fieldRef)
        {
            MembershipType = membershipType;
        }

        public Membership(Guid fieldId, MembershipType membershipType)
            : base(MembershipTag, new CamlFieldRef {Id = fieldId})
        {
            MembershipType = membershipType;
        }

        public Membership(string fieldName, MembershipType membershipType)
            : base(MembershipTag, new CamlFieldRef {Name = fieldName})
        {
            MembershipType = membershipType;
        }

        public Membership(string existingMembershipOperator)
            : base(MembershipTag, existingMembershipOperator)
        {
        }

        public Membership(XElement existingMembershipOperator)
            : base(MembershipTag, existingMembershipOperator)
        {
        }

        public MembershipType MembershipType { get; private set; }

        protected override void OnParsing(XElement existingMembershipOperator)
        {
            base.OnParsing(existingMembershipOperator);
            var type = existingMembershipOperator.AttributeIgnoreCase(TypeAttr);
            if (type != null)
            {
                var typeVaue = type.Value.Trim();
                if (string.Equals(typeVaue, "SPWeb.AllUsers", StringComparison.OrdinalIgnoreCase))
                {
                    MembershipType = MembershipType.AllUsers;
                }
                else if (string.Equals(typeVaue, "CurrentUserGroups", StringComparison.OrdinalIgnoreCase))
                {
                    MembershipType = MembershipType.CurrentUserGroups;
                }
                else if (string.Equals(typeVaue, "Group", StringComparison.OrdinalIgnoreCase))
                {
                    MembershipType = MembershipType.Group;
                }
                else if (string.Equals(typeVaue, "Groups", StringComparison.OrdinalIgnoreCase))
                {
                    MembershipType = MembershipType.Groups;
                }
                else if (string.Equals(typeVaue, "SPWeb.Users", StringComparison.OrdinalIgnoreCase))
                {
                    MembershipType = MembershipType.WebUsers;
                }
            }
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            switch (MembershipType)
            {
                case MembershipType.AllUsers:
                    el.Add(new XAttribute(TypeAttr, "SPWeb.AllUsers"));
                    break;
                case MembershipType.CurrentUserGroups:
                    el.Add(new XAttribute(TypeAttr, "CurrentUserGroups"));
                    break;
                case MembershipType.Group:
                    el.Add(new XAttribute(TypeAttr, "Group"));
                    break;
                case MembershipType.Groups:
                    el.Add(new XAttribute(TypeAttr, "Groups"));
                    break;
                case MembershipType.WebUsers:
                    el.Add(new XAttribute(TypeAttr, "SPWeb.Users"));
                    break;
            }
            return el;
        }
    }
}