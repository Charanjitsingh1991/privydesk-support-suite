import { useEffect, useState, useCallback } from 'react';
import { useEmailArchive } from '@/hooks/useEmailArchive';
import { useUser } from '@/hooks/useSession';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmailSearch } from '@/components/emails/EmailSearch';
import { EmailList } from '@/components/emails/EmailList';
import { EmailDetail } from '@/components/emails/EmailDetail';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Mail, Upload, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmailSearchFilters, EmailWithAttachments, EmailSortOption, EmailSortDirection } from '@/types/email';

const PAGE_SIZE = 50;

export default function EmailArchive() {
  const navigate = useNavigate();
  const { role } = useUser();
  const {
    emails,
    loading,
    totalCount,
    folders,
    fetchEmails,
    fetchFolders,
    getEmail,
    linkToTicket,
    unlinkFromTicket,
    markAsRead
  } = useEmailArchive();

  const [filters, setFilters] = useState<EmailSearchFilters>({});
  const [sort, setSort] = useState<EmailSortOption>('received');
  const [sortDir, setSortDir] = useState<EmailSortDirection>('desc');
  const [page, setPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithAttachments | null>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    fetchEmails(filters, sort, sortDir, page, PAGE_SIZE);
  }, [fetchEmails, filters, sort, sortDir, page]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchEmails(filters, sort, sortDir, 1, PAGE_SIZE);
  }, [fetchEmails, filters, sort, sortDir]);

  const handleSelectEmail = async (email: EmailWithAttachments) => {
    // Mark as read
    if (!email.is_read) {
      markAsRead(email.id);
    }
    
    // Fetch full email with attachments
    const fullEmail = await getEmail(email.id);
    setSelectedEmail(fullEmail);
  };

  const handleSortChange = (value: string) => {
    const [newSort, newDir] = value.split('-') as [EmailSortOption, EmailSortDirection];
    setSort(newSort);
    setSortDir(newDir);
    setPage(1);
  };

  const canImport = role === 'admin' || role === 'super_admin';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Email Archive
            </h1>
            <p className="text-muted-foreground">
              {totalCount.toLocaleString()} emails
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select 
              value={`${sort}-${sortDir}`} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received-desc">Newest First</SelectItem>
                <SelectItem value="received-asc">Oldest First</SelectItem>
                <SelectItem value="sender-asc">Sender A-Z</SelectItem>
                <SelectItem value="sender-desc">Sender Z-A</SelectItem>
                <SelectItem value="subject-asc">Subject A-Z</SelectItem>
              </SelectContent>
            </Select>

            {canImport && (
              <Button onClick={() => navigate('/dashboard/settings/email-migration')}>
                <Upload className="h-4 w-4 mr-2" />
                Import Emails
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <EmailSearch
            filters={filters}
            folders={folders}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />
        </div>

        {/* Email List & Detail */}
        <div className="flex-1 border rounded-lg overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  <EmailList
                    emails={emails}
                    loading={loading}
                    selectedId={selectedEmail?.id}
                    onSelect={handleSelectEmail}
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t p-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={60} minSize={40}>
              <EmailDetail
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onLinkToTicket={linkToTicket}
                onUnlinkFromTicket={unlinkFromTicket}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DashboardLayout>
  );
}
