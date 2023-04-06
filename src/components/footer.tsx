export const Footer = () => {
  return (
    <footer className="footer footer-center text-base-content text-opacity-50">
      <div>
        <div className="grid grid-flow-col gap-2">
          <a className="link link-hover" href="https://twitter.com/MomentSwap">
            MomentSwap on Twitter
          </a>
        </div>
        <div className="grid grid-flow-col gap-2">
          <a className="link link-hover" href="https://storswift.gitbook.io/momentswap/">
            Features
          </a>
          <p>·</p>
          <a className="link link-hover" href="https://storswift.gitbook.io/momentswap/">
            Ideas
          </a>
          <p>·</p>
          <a className="link link-hover" href="https://github.com/momentswap/momentswap">
            Code Repository
          </a>
        </div>
      </div>
    </footer>
  );
};
