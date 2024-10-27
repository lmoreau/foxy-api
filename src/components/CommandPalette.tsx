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
      if (search.trim() && !search.startsWith('>')) {
        try {
          const response = await listAccountsForResidualCheck();
          const filteredAccounts = response.value.filter((account: Account) =>
            account.name.toLowerCase().includes(search.toLowerCase())
          );
          setAccounts(filteredAccounts);
        } catch (error) {
          console.error('Error searching accounts:', error);
        }
      } else {
        setAccounts([]);
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

  return (
    <div className="search-container">
      <div className="search-bar" onClick={() => setOpen(true)}>
        <SearchOutlined className="search-icon" />
        <input 
          type="text"
          placeholder="Search accounts or type '>' for commands... (⌘K)"
          readOnly
          className="search-input"
        />
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="command-dialog"
      >
        <Command.Input 
          value={search}
          onValueChange={setSearch}
          placeholder="Search accounts or type '>' for commands..."
          className="command-input"
          autoFocus
        />

        <Command.List className="command-list">
          <Command.Empty>No results found.</Command.Empty>

          {!search.startsWith('>') && accounts.map((account) => (
            <Command.Item
              key={account.accountid}
              onSelect={() => {
                navigate(`/residual-details/${account.accountid}`);
                setOpen(false);
              }}
              className="command-item"
            >
              <span>{account.name}</span>
            </Command.Item>
          ))}

          {search.startsWith('>') && pages.map((page) => (
            <Command.Item
              key={page.path}
              onSelect={() => {
                navigate(page.path);
                setOpen(false);
              }}
              className="command-item"
            >
              <span>{page.name}</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </div>
  );
};

export default CommandPalette;
