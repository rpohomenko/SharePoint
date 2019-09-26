using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SP.Client.Extensions
{
    public static class LinqExtensions
    {
        public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
        {
            foreach (var obj in source)
                action(obj);
        }

        public static void ForEach<T>(this IEnumerable source, Action<T> action)
        {
            foreach (T obj in source)
                action(obj);
        }

        public static IEnumerable<TSource> RecursiveSelect<TSource>(this IEnumerable<TSource> source,
            Func<TSource, IEnumerable<TSource>> childSelector)
        {
            return RecursiveSelect(source, childSelector, element => element);
        }

        public static IEnumerable<TResult> RecursiveSelect<TSource, TResult>(this IEnumerable<TSource> source,
            Func<TSource, IEnumerable<TSource>> childSelector, Func<TSource, TResult> selector)
        {
            return RecursiveSelect(source, childSelector, (element, index, depth) => selector(element));
        }

        public static IEnumerable<TResult> RecursiveSelect<TSource, TResult>(this IEnumerable<TSource> source,
            Func<TSource, IEnumerable<TSource>> childSelector, Func<TSource, int, TResult> selector)
        {
            return RecursiveSelect(source, childSelector, (element, index, depth) => selector(element, index));
        }

        public static IEnumerable<TResult> RecursiveSelect<TSource, TResult>(this IEnumerable<TSource> source,
            Func<TSource, IEnumerable<TSource>> childSelector, Func<TSource, int, int, TResult> selector)
        {
            return RecursiveSelect(source, childSelector, selector, 0);
        }

        public static IEnumerable<TResult> RecursiveSelect<TSource, TResult>(this IEnumerable<TSource> source,
            Func<TSource, IEnumerable<TSource>> childSelector, Func<TSource, int, int, TResult> selector, int depth)
        {
            return source.SelectMany((element, index) => Enumerable.Repeat(selector(element, index, depth), 1)
                .Concat(RecursiveSelect(childSelector(element) ?? Enumerable.Empty<TSource>(),
                    childSelector, selector, depth + 1)));
        }

        public static IEnumerable<T> RemoveDuplicates<T>(this IEnumerable<T> source)
        {
            return RemoveDuplicates(source, (t1, t2) => t1.Equals(t2));
        }

        public static IEnumerable<T> RemoveDuplicates<T>(this IEnumerable<T> source, Func<T, T, bool> equater)
        {
            var result = new List<T>();
            foreach (var item in source.Where(item => result.All(t => !equater(item, t))))
            {
                result.Add(item);
            }
            return result;
        }

        public static T FirstOrDefaultFromMany<T>(this IEnumerable<T> source, Func<T, IEnumerable<T>> childrenSelector,
            Predicate<T> condition)
        {
            while (true)
            {
                // return default if no items
                var enumerable = source as T[] ?? source.ToArray();
                if (source == null || !enumerable.Any()) return default(T);
                // return result if found and stop traversing hierarchy
                var attempt = enumerable.FirstOrDefault(t => condition(t));
                if (!Equals(attempt, default(T))) return attempt;
                // recursively call this function on lower levels of the
                // hierarchy until a match is found or the hierarchy is exhausted
                source = enumerable.SelectMany(childrenSelector);
            }
        }

        public static IEnumerable Cast(this IEnumerable source, Type elementType)
        {
            MethodInfo castMethod = elementType.IsGenericType
                ? typeof(Enumerable).GetMethod("Cast").MakeGenericMethod(elementType.GenericTypeArguments)
                : typeof(Enumerable).GetMethod("Cast").MakeGenericMethod(new Type[] { elementType });
            var result = castMethod.Invoke(null, new object[] { source });
            return (IEnumerable)result;
        }

        public static Array ToArray(this IEnumerable source, Type elementType)
        {
            MethodInfo toArrayMethod = typeof(Enumerable).GetMethod("ToArray")
                 .MakeGenericMethod(new Type[] { elementType });
            return (Array)toArrayMethod.Invoke(null, new object[] { Cast(source, elementType) });
        }
        public static ICollection ToList(this IEnumerable source, Type elementType)
        {
            MethodInfo toArrayMethod = typeof(Enumerable).GetMethod("ToList")
                 .MakeGenericMethod(new Type[] { elementType });
            return (ICollection)toArrayMethod.Invoke(null, new object[] { Cast(source, elementType) });
        }
    }
}