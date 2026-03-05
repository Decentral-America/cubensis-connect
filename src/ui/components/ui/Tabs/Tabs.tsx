import * as styles from './tabs.module.css';
import * as React from 'react';
import cn from 'classnames';

interface TabProps {
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
  onActivate?: () => void;
}

export function Tab({ className, children, isActive, onActivate }: TabProps) {
  return (
    <li
      className={cn(styles.tabListItem, { [styles.tabListActive]: isActive }, className)}
      onClick={onActivate}
    >
      {children}
    </li>
  );
}

interface TabListProps {
  activeIndex?: number;
  children: React.ReactElement | React.ReactElement[];
  className?: string;
  onActiveTab?: (index: number) => void;
}

export function TabList({ activeIndex, children, className, onActiveTab }: TabListProps) {
  return (
    <ol className={cn(styles.tabList, className)}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child as React.ReactElement<TabProps>, {
          isActive: index === activeIndex,
          onActivate: () => onActiveTab?.(index),
        }),
      )}
    </ol>
  );
}

interface TabPanelsProps {
  activeIndex?: number;
  children: React.ReactElement | React.ReactElement[];
  className?: string;
}

export function TabPanels({ activeIndex, children, className }: TabPanelsProps) {
  const childArray = React.Children.toArray(children);

  return <div className={className}>{childArray[activeIndex]}</div>;
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={className}>{children}</div>;
}

interface TabsProps {
  activeTab?: number;
  children: [React.ReactElement, React.ReactElement];
  onTabChange?: (activeIndex: number) => void;
}

export function Tabs({ children, activeTab, onTabChange }: TabsProps) {
  const [activeIndex, setActiveIndex] = React.useState(activeTab || 0);

  return (
    <>
      {React.Children.map(children, (child) => {
        switch ((child as React.ReactElement<unknown>).type) {
          case TabPanels:
            return React.cloneElement(child as React.ReactElement<TabPanelsProps>, {
              activeIndex: activeIndex,
            });
          case TabList:
            return React.cloneElement(child as React.ReactElement<TabListProps>, {
              activeIndex: activeIndex,
              onActiveTab: (activeIndex: number) => {
                if (onTabChange) {
                  onTabChange(activeIndex);
                }
                setActiveIndex(activeIndex);
              },
            });
          default:
            return child;
        }
      })}
    </>
  );
}
