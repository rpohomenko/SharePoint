using LinqToSP.Test.Model;
using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

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

      using (var ctx = new SpDataContext(siteUrl))
      {
        var clientContext = ctx.Context;

        string userLogin = ConfigurationManager.AppSettings["userLogin"];
        while (string.IsNullOrWhiteSpace(userLogin))
        {
          Console.WriteLine("Enter User Login: ");
          userLogin = Console.ReadLine();
        }
        clientContext.Credentials = new SharePointOnlineCredentials(userLogin, string.IsNullOrWhiteSpace(userPassword) ? GetPassword() : ConvertToSecureString(userPassword));

        Deploy(ctx);

        ImportData(ctx, false);

        var departments = ctx.List<Department>().ToArray();

        var employees = departments.First().Employees.ToArray();

        if (!employees.Any())
        {
          employees = ctx.List<Employee>().ToArray();
        }

        var managers = employees.First().Managers.ToArray();

        Debugger.Break();
        Console.ForegroundColor = ConsoleColor.Green;
        //Console.WriteLine("Done!");
        Console.ResetColor();
      }

      Console.ReadKey();
    }

    private static void Deploy(SpDataContext spContext)
    {
      Console.WriteLine("Deploying...");
      var model = spContext.CreateModel<EmployeeProvisionModel<SpDataContext>, SpDataContext, Employee>();
      model.Provision();
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

      spContext.List<Department>().AddOrUpdate(new Department()
      {
        Title = "Warner Brothers"
      }, 1);

      spContext.List<Employee>().AddOrUpdate(new Employee()
      {
        FirstName = "Emma",
        LastName = "Stone",
        Phone = "11-1111-111",
        Email = "emma.stone@people.com",
        Position = EmployeePosition.Manager
      }, 1);

      var specialist = new Employee()
      {
        FirstName = "Will",
        LastName = "Smith",
        Phone = "11-1143-222",
        Email = "will.smith@people.com",
        Position = EmployeePosition.Specialist,
        DepartmentId = 1
      };

      specialist.Manager.EntityId = 1;
      //specialist.Department.EntityId = 1;

      spContext.List<Employee>().AddOrUpdate(specialist, 2);

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
