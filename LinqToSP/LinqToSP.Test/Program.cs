using LinqToSP.Test.Model;
using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Provisioning;
using System;
using System.Configuration;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Security;

namespace LinqToSP.Test
{
  class Program
  {
    static void Main(string[] args)
    {
      string siteUrl = ConfigurationManager.AppSettings["siteUrl"];
      while (string.IsNullOrWhiteSpace(siteUrl))
      {
        Console.WriteLine("Enter Site Url: ");
        siteUrl = Console.ReadLine();
      }

      string userPassword = ConfigurationManager.AppSettings["userPassword"];


      Department[] departments;
      Employee[] employees;

      //using (var context = new MyContext())
      //{
      //  departments = context.Departments/*.AsNoTracking()*/.ToArray();
      //  employees = context.Employees/*.AsNoTracking()*/.ToArray();
      //}

      using (var clientContext = new ClientContext(siteUrl))
      {
        string userLogin = ConfigurationManager.AppSettings["userLogin"];
        while (string.IsNullOrWhiteSpace(userLogin))
        {
          Console.WriteLine("Enter User Login: ");
          userLogin = Console.ReadLine();
        }
        clientContext.Credentials = new SharePointOnlineCredentials(userLogin, string.IsNullOrWhiteSpace(userPassword) ? GetPassword() : ConvertToSecureString(userPassword));

        using (var ctx = new SpDataContext(clientContext))
        {
          //Deploy(ctx, true);

          //ImportData(ctx, false);

          departments = ctx.List<Department>().Where(i => i.Id > 0).ToArray();

          //employees = departments.First().EmployeesSet.ToArray();

          //if (!employees.Any())
          //{
          employees = ctx.List<Employee>().ToArray();
          //}

          var managers = employees.First().Managers;

          ctx.Close();
        }
      }

      using (var context = new MyContext())
      {
        //var a = context.Departments.ToArray();

        foreach (var d in departments)
        {
          if (context.Departments.AsNoTracking().FirstOrDefault(i => i.Id == d.Id) == null)
          {
            var department = context.Departments.Add(d);
          }
          else
          {
            context.Set<Department>().Attach(d);
            context.Entry(d).State = EntityState.Modified;
          }
        }

        context.SaveChanges();

        foreach (var e in employees)
        {
          if (context.Employees.AsNoTracking().FirstOrDefault(i => i.Id == e.Id) == null)
          {
            context.Employees.Add(e);
          }
          else
          {
            context.Set<Employee>().Attach(e);
            context.Entry(e).State = EntityState.Modified;

          }
        }

        context.SaveChanges();
      }

      Debugger.Break();
      Console.ForegroundColor = ConsoleColor.Green;
      //Console.WriteLine("Done!");
      Console.ResetColor();



      Console.ReadKey();
    }

    private static void Deploy(SpDataContext spContext, bool overwrite)
    {
      Console.WriteLine("Deploying...");
      var model = new EmployeeProvisionModel<SpDataContext>(spContext);
      //if (overwrite)
      {
        model.UnProvision(true, ProvisionLevel.Web);
      }
      model.Provision(overwrite, ProvisionLevel.Web);
      Console.ForegroundColor = ConsoleColor.Green;
      Console.WriteLine("Done!");
      Console.ResetColor();
    }

    private static void ImportData(SpDataContext spContext, bool clear)
    {
      if (clear)
      {
        //delete all items.
        while (spContext.List<Department>().Take(100).DeleteAll())
        {
          spContext.SaveChanges();
        }
        while (spContext.List<Employee>().Take(100).DeleteAll())
        {
          spContext.SaveChanges();
        }
      }


      //var dep = spContext.List<Department>().GetEntries().First().Entity;
      //dep.Title = "Warner Brothers";

      var department = spContext.List<Department>().AddOrUpdate(new Department()
      {
        Title = "Warner Brothers",
        ShortName = "WB"
      }, 1, true);

      spContext.SaveChanges();

      //department = spContext.List<Department>().AddOrUpdate(dep);
      //spContext.SaveChanges();

      var manager = spContext.List<Employee>().AddOrUpdate(new Employee()
      {
        FirstName = "Emma",
        LastName = "Stone",
        Phone = "8-1111-999",
        Email = "emma.stone@people.com",
        Position = EmployeePosition.Manager | EmployeePosition.Specialist
      }, 1, true);

      // save lookups
      spContext.SaveChanges();

      var specialist = new Employee()
      {
        FirstName = "Will",
        LastName = "Smith",
        Phone = "7-1143-222",
        Email = "will.smith@people.com",
        Position = EmployeePosition.Specialist
      };

      specialist.DepartmentLookup.SetEntity(department.Entity);

      specialist.ManagerLookup.SetEntities(new[] { manager.Entity });

      var entry = spContext.List<Employee>().AddOrUpdate(specialist, 2, true, true);

      spContext.SaveChanges();
    }

    private static SecureString GetPassword()
    {
      Console.WriteLine("Enter Password: ");

      ConsoleKeyInfo info;
      //Get the user's password as a SecureString  
      SecureString securePassword = new SecureString();
      do
      {
        info = Console.ReadKey(true);
        if (info.Key != ConsoleKey.Enter && info.Key != ConsoleKey.LeftArrow && info.Key != ConsoleKey.RightArrow)
        {
          if (info.Key == ConsoleKey.Backspace || info.Key == ConsoleKey.Delete)
          {
            if (securePassword.Length > 0)
            {
              securePassword.RemoveAt(securePassword.Length - 1);
            }
            Console.Write("\b \b");
          }
          else
          {
            securePassword.AppendChar(info.KeyChar);
            Console.Write("*");
          }
        }
      }
      while (info.Key != ConsoleKey.Enter);
      return securePassword;
    }

    private static SecureString ConvertToSecureString(string password)
    {
      if (password == null)
        throw new ArgumentNullException("password");

      var securePassword = new SecureString();

      foreach (char c in password)
        securePassword.AppendChar(c);

      securePassword.MakeReadOnly();
      return securePassword;
    }

  }
}
