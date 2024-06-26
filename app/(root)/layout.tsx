import Footer from "@/components/shared/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <div className="root-container">
        <div className="wrapper">{children}</div>
        <Footer />
      </div>
    </main>
  );
};

export default Layout;
