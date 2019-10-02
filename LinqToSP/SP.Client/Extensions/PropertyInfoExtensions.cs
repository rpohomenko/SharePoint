
namespace System.Reflection
{
  public static class PropertyInfoExtensions
  {
    public static bool IsStatic(this PropertyInfo property)
        => (property.GetMethod ?? property.SetMethod).IsStatic;
  }
}
