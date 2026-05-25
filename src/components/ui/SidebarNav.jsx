import React from "react";

/**
 * SidebarNav — Reusable vertical navigation for profile/dashboard sidebars.
 *
 * @param {Array}    items       — [{id, label, icon, badge?, disabled?}]
 * @param {string}   activeId    — Currently active item id
 * @param {Function} onChange    — Callback(id) when item clicked
 * @param {ReactNode} header    — Optional header content (avatar, user info)
 * @param {ReactNode} footer    — Optional footer content
 * @param {string}   className  — Extra wrapper classes
 */
const SidebarNav = ({
  items = [],
  activeId,
  onChange,
  header,
  footer,
  className = "",
}) => {
  return (
    <aside className={`profile-sidebar ${className}`}>
      {/* Header area (avatar, user info, etc.) */}
      {header && <div className="mb-4">{header}</div>}

      {/* Navigation items */}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          if (item.divider) {
            return (
              <div
                key={item.id || `div-${Math.random()}`}
                className="my-2 border-t border-[var(--color-border)]"
              />
            );
          }

          if (item.section) {
            return (
              <p
                key={item.id || item.section}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-4 mb-1 px-4"
              >
                {item.section}
              </p>
            );
          }

          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !item.disabled && onChange?.(item.id)}
              disabled={item.disabled}
              className={`profile-nav-item ${isActive ? "active" : ""} ${
                item.disabled ? "opacity-40 cursor-not-allowed" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon && (
                <span className="nav-icon">{item.icon}</span>
              )}
              <span className="truncate flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="profile-nav-badge">{item.badge > 99 ? "99+" : item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer area */}
      {footer && <div className="mt-auto pt-4 border-t border-[var(--color-border)] mt-6">{footer}</div>}
    </aside>
  );
};

export default SidebarNav;
