using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using JetBrains.Annotations;

namespace SP.Client.Extensions
{
  [DebuggerStepThrough]
  public static class Check
  {
    [ContractAnnotation("value:null => halt")]
    public static T NotNull<T>([NoEnumeration] T value, [InvokerParameterName] [NotNull] string parameterName)
    {
      if (ReferenceEquals(value, null))
      {
        NotEmpty(parameterName, nameof(parameterName));

        throw new ArgumentNullException(parameterName);
      }

      return value;
    }

    [ContractAnnotation("value:null => halt")]
    public static IReadOnlyList<T> NotEmpty<T>(IReadOnlyList<T> value, [InvokerParameterName] [NotNull] string parameterName)
    {
      NotNull(value, parameterName);

      if (value.Count == 0)
      {
        NotEmpty(parameterName, nameof(parameterName));

        throw new ArgumentException(parameterName);
      }

      return value;
    }

    [ContractAnnotation("value:null => halt")]
    public static string NotEmpty(string value, [InvokerParameterName] [NotNull] string parameterName)
    {
      Exception e = null;
      if (value is null)
      {
        e = new ArgumentNullException(parameterName);
      }
      else if (value.Trim().Length == 0)
      {
        e = new ArgumentException(parameterName);
      }

      if (e != null)
      {
        NotEmpty(parameterName, nameof(parameterName));

        throw e;
      }

      return value;
    }

    public static string NullButNotEmpty(string value, [InvokerParameterName] [NotNull] string parameterName)
    {
      if (!(value is null)
          && value.Length == 0)
      {
        NotEmpty(parameterName, nameof(parameterName));

        throw new ArgumentException(parameterName);
      }

      return value;
    }

    public static IReadOnlyList<T> HasNoNulls<T>(IReadOnlyList<T> value, [InvokerParameterName] [NotNull] string parameterName)
        where T : class
    {
      NotNull(value, parameterName);

      if (value.Any(e => e == null))
      {
        NotEmpty(parameterName, nameof(parameterName));

        throw new ArgumentException(parameterName);
      }

      return value;
    }
  }
}
