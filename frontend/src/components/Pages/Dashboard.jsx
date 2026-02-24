import { useNavigate, useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const isStoreManagerOrAdmin =
    user?.isAdmin ||
    user?.role?.toLowerCase() === "store manager" ||
    user?.role?.toLowerCase() === "admin";

  const isStaffMember = user?.role?.toLowerCase() === "staff member";

  const actions = [
    {
      title: "Product Inventory",
      description: "Manage your product catalog, prices, and stock levels.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      path: "/product",
      allowed: isStoreManagerOrAdmin || isStaffMember,
      color: "bg-indigo-50",
    },
    {
      title: "Add New Product",
      description: "Register new items into the system with QR code generation.",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      path: "/add-product",
      allowed: isStoreManagerOrAdmin,
      color: "bg-green-50",
    },
    {
      title: "Scan & Bill",
      description: "Process customer purchases using the QR scanner.",
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4c1 0 2 1 2 2v6W8 19.86l7.1-7.1a1 1 0 011.4 0l.01.01a1 1 0 010 1.41L12.8 18l1.6 3.9L20 6H6" />
          {/* Using a simpler scan icon conceptualization for reliability or just a generic search/scan icon */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      path: "/scan",
      allowed: isStoreManagerOrAdmin || isStaffMember,
      color: "bg-purple-50",
    },
    {
      title: "Category Manager",
      description: "Organize products into categories and sub-categories.",
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      path: "/category-manager",
      allowed: isStoreManagerOrAdmin,
      color: "bg-orange-50",
    },
    {
      title: "Staff Management",
      description: "Manage staff accounts and permissions.",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: "/staff",
      allowed: isStoreManagerOrAdmin,
      color: "bg-blue-50",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || user?.username || "Admin"}. Here's what's happening in your store.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actions.filter(a => a.allowed).map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.path)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${action.color}`}>
                  {action.icon}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0 1 1 0 00-2 0zm-9-8a1 1 0 00-1 1v1zm-1 12a1 1 0 102 0 1 1 0 00-2 0zM4 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0 1 1 0 00-2 0z" opacity="0" />
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          ))}
        </div>

        {/* Placeholder for Quick Stats or recent activity could go here */}

      </div>
    </div>
  );
}