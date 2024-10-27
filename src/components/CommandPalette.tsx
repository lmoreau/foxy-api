import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { listAccountsForResidualCheck } from '../utils/api';

import './CommandPalette.css';

interface Account {
  accountid: string;
  name: string;
}

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Toggle command palette with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search accounts when typing
  useEffect(() => {
    const searchAccounts = async () => {
      if (search.trim()) {
        try {
          const response = await listAccountsForResidualCheck();
          const filteredAccounts = response.value.filter((account: Account) =>
            account.name.toLowerCase().includes(search.toLowerCase())
          );
          setAccounts(filteredAccounts);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching accounts:', error);
        }
      } else {
        setAccounts([]);
        setShowResults(false);
      }
    };

    searchAccounts();
  }, [search]);

  const pages = [
    { name: 'Residual Check', path: '/residual-check' },
    { name: 'Products', path: '/products' },
    { name: 'Quotes', path: '/quotes' },
    { name: 'Customers', path: '/customers' },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!open) {
      setOpen(true);
    }
  };

  const handleItemSelect = (path: string) => {
    navigate(path);
    setSearch('');
    setOpen(false);
    setShowResults(false);
  };

  return (
    <div className="search-container">
      <div className={`search-bar ${showResults ? 'with-results' : ''}`}>
        <SearchOutlined className="search-icon" />
        <input 
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search accounts or type '>' for commands... (⌘K)"
          className="search-input"
        />
      </div>

      {(open || showResults) && (
        <div className="search-results">
          {!search.startsWith('>') && accounts.map((account) => (
            <div
              key={account.accountid}
              className="search-result-item"
              onClick={() => handleItemSelect(`/residual-details/${account.accountid}`)}
            >
              <span>{account.name}</span>
            </div>
          ))}

          {search.startsWith('>') && pages.map((page) => (
            <div
              key={page.path}
              className="search-result-item"
              onClick={() => handleItemSelect(page.path)}
            >
              <span>{page.name}</span>
            </div>
          ))}

          {search && accounts.length === 0 && !search.startsWith('>') && (
            <div className="search-result-item no-results">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommandPalette;
