'use client';
import Header from '@/components/recipe-snap/header';
import HistoryList from '@/components/recipe-snap/history-list';

export default function HistoryPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <HistoryList />
      </main>
    </div>
  );
}
