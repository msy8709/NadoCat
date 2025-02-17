import React /*, { useState }*/ from "react";
import "../../styles/scss/components/streetCat/tabNavigation.scss";

interface ITab {
  id: number;
  label: string;
}

interface ITabNavigationProps {
  selectedTab: number;
  onSelectTab: (id: number) => void;
}

const tabs: ITab[] = [
  { id: 1, label: "동네 고양이 도감" },
  { id: 2, label: "내 도감" },
  { id: 3, label: "동네 고양이 지도" },
];

const TabNavigation: React.FC<ITabNavigationProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const handleTabClick = (id: number) => {
    onSelectTab(id);
  };

  return (
    <nav className="street-cat-nav">
      <ul>
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={tab.id === selectedTab ? "active" : ""}
            onClick={() => handleTabClick(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.id === selectedTab && <span className="nav-bar"></span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TabNavigation;
