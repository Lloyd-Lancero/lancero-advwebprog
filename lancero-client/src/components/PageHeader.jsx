// Blue intro block used at the top of every page
const PageHeader = ({ eyebrow, title, text, children }) => {
  return (
    <section className="hero">
      <div className="wrap">
        {eyebrow && <p className="eyebrow-light mb-3">{eyebrow}</p>}
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">{title}</h1>
        {text && <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-100 sm:text-base">{text}</p>}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
};

export default PageHeader;
