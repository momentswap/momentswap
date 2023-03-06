import { ArrowLeftIcon, ClockIcon, UserIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import momenttools from "moment";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Avatar, Layout, Moment, PriceButton, Tab, ThemeToggle } from "@components";
import { useMomentSwapContract, useSpaceFNSContract, useSpaceStateProvider, useWalletProvider } from "@hooks";
import { MomentMetadata } from "@utils/definitions/interfaces";
import { collectionToMoments } from "@utils/helpers/collection-to-moments";
import Link from "next/link";

export default function UserPage() {
  const router = useRouter();
  const queryAddress = router.query.address as string;
  const { address } = useWalletProvider();
  const { getNFTCollectionByOwner } = useMomentSwapContract();
  const { getAllDomainByWallet } = useSpaceFNSContract();
  const { mainDomain } = useSpaceStateProvider();
  const [userImg, setUserImg] = useState<string | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState("Moments");
  const [tabPage, setTabPage] = useState(<></>);
  const [moments, setMoments] = useState<Array<MomentMetadata>>();
  const [price, setPrice] = useState<string>("1");
  const [leaseName, setLeaseName] = useState<string>("");
  const [spaceSlots, setSpaceSlots] = useState([
    {
      used: true,
      name: "abc",
      start: 1676881934,
      end: 1704038400,
      price: "98",
      owner: "0xC0dAdf4a753006Ca4AD6977406FD94aEE5B44285",
    },
    {
      used: true,
      name: "tomcls",
      start: 1676881934,
      end: 1684038400,
      price: "77",
      owner: "0xBaAcA1B51B2A52CB1300046f0d310f08fBc7f09d",
    },
    {
      used: false,
      name: null,
      start: null,
      end: null,
      price: "199",
      owner: "0xC0dAdf4a753006Ca4AD6977406FD94aEE5B44285",
    },
    {
      used: false,
      name: null,
      start: null,
      end: null,
      price: "166.6",
      owner: "0xC0dAdf4a753006Ca4AD6977406FD94aEE5B44285",
    },
    {
      used: false,
      name: null,
      start: null,
      end: null,
      price: "199",
      owner: "0xBaAcA1B51B2A52CB1300046f0d310f08fBc7f09d",
    },
  ]);

  const priceOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (!validatePrice(value)) {
        return;
      }
      setPrice(value || "1");
    },
    [setPrice],
  );

  const leaseNameOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLeaseName(e.target.value);
    },
    [setLeaseName],
  );

  const handleConfirmLease = useCallback(() => {
    if (!validateLeaseName(leaseName)) {
      alert("Please enter the correct name.");
      return;
    }
  }, [leaseName]);

  const renderMomentsPage = useCallback(() => {
    const _tabPage = (
      <AnimatePresence>
        {moments?.map((moment) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Moment key={moment.id} moment={moment} />
          </motion.div>
        ))}
      </AnimatePresence>
    );
    setTabPage(_tabPage);
  }, [moments]);

  const renderLikesPage = useCallback(() => {
    const _tabPage = <p>coming soon...</p>;
    setTabPage(_tabPage);
  }, []);

  const renderSpaceDNPage = useCallback(() => {
    const _tabPage = (
      <>
        {/* Price Modal */}
        <input type="checkbox" id="price-modal" className="modal-toggle" />
        <label htmlFor="price-modal" className="modal cursor-pointer select-none">
          <label htmlFor="" className="modal-box px-14">
            <label htmlFor="price-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>

            <h3 className="font-bold text-lg">Set Price</h3>
            <div className="mt-5">
              <div className="input-group">
                <input
                  type="text"
                  value={price}
                  placeholder="Amount"
                  className="input input-bordered"
                  onChange={priceOnChange}
                />
                <span>FIL</span>
              </div>
            </div>
            <div className="divider" />
            <div className="modal-action">
              <label htmlFor="price-modal" className="btn btn-primary" onClick={() => {}}>
                Save
              </label>
            </div>
          </label>
        </label>

        {/* Lease Modal */}
        <input type="checkbox" id="lease-modal" className="modal-toggle" />
        <label htmlFor="lease-modal" className="modal cursor-pointer select-none">
          <label htmlFor="" className="modal-box px-14">
            <label htmlFor="lease-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>

            <h3 className="font-bold text-lg">Sapce Domain Name Lease</h3>
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={leaseName}
                  placeholder="3 to 10 strings"
                  className="input input-bordered"
                  onChange={leaseNameOnChange}
                />
                <span>.{mainDomain || "---"}.fil</span>
              </div>
            </div>
            <div className="divider" />
            <div className="modal-action">
              <label htmlFor="lease-modal" className="btn btn-primary" onClick={handleConfirmLease}>
                Register
              </label>
            </div>
          </label>
        </label>

        <h3 className="text-lg font-semibold m-2">Space Slots</h3>
        <div className="border-t-[1px] border-base-content/25">
          <AnimatePresence>
            {spaceSlots.map((slot, index) => (
              <motion.div
                key={slot.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <div className="flex h-20 border-b-[1px] border-base-content/25 items-center">
                  {/* Left area */}
                  <div className="text-center ml-5">{index + 1}</div>
                  <div className="divider divider-horizontal my-4"></div>
                  {/* Content area */}
                  <div className="flex-col w-full">
                    <span className="font-medium ">{`${slot.name || "space" + (index + 1)}.${mainDomain}.fil`}</span>
                    <div className="flex-col text-xs">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {slot.used ? (
                          <p>
                            <span className="badge badge-accent badge-xs">
                              {slot.start && momenttools.unix(slot.start).format("YYYY-MM-DD")}
                            </span>
                            <span>&nbsp;➞&nbsp;</span>
                            <span className="badge badge-accent badge-xs">
                              {slot.end && momenttools.unix(slot.end).format("YYYY-MM-DD")}
                            </span>
                          </p>
                        ) : (
                          <div className="badge badge-secondary badge-xs">#EMPTY</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 w-0">
                        <div className="h-4 w-4">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        {slot.used ? (
                          <Link className="font-mono underline" href={`/user/${address}`}>
                            {address}
                          </Link>
                        ) : (
                          <span className="badge badge-secondary badge-xs">#EMPTY</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right area */}
                  <div className="mr-1">
                    <PriceButton
                      onClick={() => setPrice(slot.price)}
                      iconSrc="https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png"
                      price={slot.price}
                      htmlFor={address === queryAddress ? "price-modal" : "lease-modal"}
                    >
                      {address === queryAddress ? "Sell" : "Buy"}
                    </PriceButton>
                  </div>
                  {/* <div
                    onClick={() => setPrice(slot.price)}
                    className="cursor-pointertext-sm border-2 rounded-full mr-1 hover:border-neutral active:border-neutral-focus w-48 h-8 overflow-hidden hvr-shadow"
                  >
                    <div className="flex items-center text-sm p-1">
                      <img
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png"
                        alt="FIL"
                        className="w-4 h-4"
                      />
                      <span className="truncate mx-auto">{slot.price}</span>
                    </div>
                    {address === queryAddress ? (
                      <label
                        htmlFor="price-modal"
                        className="block relative -top-8 w-32 h-8 text-sm text-white text-center font-bold leading-9 bg-neutral active:bg-neutral-focus opacity-0 hover:opacity-100"
                      >
                        SELL
                      </label>
                    ) : (
                      <label
                        htmlFor="lease-modal"
                        className="block relative -top-8 w-32 h-8 text-sm text-white text-center font-bold leading-9 bg-neutral-focus opacity-0 hover:opacity-100"
                      >
                        BUY
                      </label>
                    )}
                  </div> */}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold m-2">You Rented</h2>
            <div className="border-t-[1px] border-base-content/25">
              <AnimatePresence>
                {spaceSlots.map((slot, index) => (
                  <motion.div
                    key={slot.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <div key={index} className="flex h-20 border-b-[1px] border-base-content/25 items-center">
                      {/* Left area */}
                      <div className="text-center ml-5">{index + 1}</div>
                      <div className="divider divider-horizontal my-4"></div>
                      {/* Content area */}
                      <div className="flex-col w-full">
                        <span className="font-medium ">{`${
                          slot.name || "space" + (index + 1)
                        }.${mainDomain}.fil`}</span>
                        <div className="flex-col text-xs">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {slot.used ? (
                              <p>
                                <span className="badge badge-accent badge-xs">
                                  {slot.start && momenttools.unix(slot.start).format("YYYY-MM-DD")}
                                </span>
                                <span>&nbsp;➞&nbsp;</span>
                                <span className="badge badge-accent badge-xs">
                                  {slot.end && momenttools.unix(slot.end).format("YYYY-MM-DD")}
                                </span>
                              </p>
                            ) : (
                              <div className="badge badge-secondary badge-xs">#EMPTY</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 w-0">
                            <div className="h-4 w-4">
                              <UserIcon className="h-4 w-4" />
                            </div>
                            {slot.used ? (
                              <Link className="font-mono underline" href={`/user/${address}`}>
                                {address}
                              </Link>
                            ) : (
                              <span className="badge badge-secondary badge-xs">#EMPTY</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </>
    );
    setTabPage(_tabPage);
  }, [
    address,
    handleConfirmLease,
    leaseName,
    leaseNameOnChange,
    price,
    priceOnChange,
    queryAddress,
    spaceSlots,
    mainDomain,
  ]);

  // Get collection from the contract when provider is updated.
  useEffect(() => {
    (async () => {
      const collection = await getNFTCollectionByOwner(queryAddress);
      setMoments(await collectionToMoments(collection));
    })();
  }, [getNFTCollectionByOwner, queryAddress]);

  //TODO: Wait for user to configure interface
  useEffect(() => {
    setUserImg(localStorage.getItem("user-img") || undefined);
  }, [queryAddress]);

  useEffect(() => {
    if ("Moments" === currentTab) {
      renderMomentsPage();
    } else if ("Likes" === currentTab) {
      renderLikesPage();
    } else if ("Space DN" === currentTab) {
      renderSpaceDNPage();
    }
  }, [currentTab, renderLikesPage, renderMomentsPage, renderSpaceDNPage]);

  const validatePrice = (value: string) => {
    if (value.includes(" ")) return false;
    const price = Number(value);
    return !Number.isNaN(price) && price >= 0 && price < Number.MAX_SAFE_INTEGER;
  };

  const validateLeaseName = (value: string) => {
    const pattern = /^[a-zA-Z0-9_-]{3,10}$/;
    return pattern.test(value);
  };

  return (
    <>
      <Layout>
        <div className="border-l border-r border-primary xl:min-w-[576px] flex-grow max-w-xl">
          <div className="flex p-2 sticky top-0 z-50 bg-base-200 border-primary gap-2">
            <div onClick={() => router.back()}>
              <ArrowLeftIcon className="rounded-full h-9 w-9 p-2 hover:bg-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold my-auto">{mainDomain || "Profile"}</h2>
            <div className="flex items-center justify-center px-0 ml-auto w-9 h-9">
              {/* <SparklesIcon className="h-5" /> */}
              <ThemeToggle />
            </div>
          </div>
          {/* Head  */}
          <div className="w-full h-[160px] bg-gradient-to-r from-secondary to-neutral mb-16">
            <div className="rounded-full relative top-28 left-8 w-[100px] h-[100px] bg-base-100 flex">
              <Avatar image={userImg} seed={queryAddress} diameter={90} className="m-auto" />
            </div>
          </div>

          {/* Body */}
          <label
            htmlFor="identity-modal"
            className={`btn btn-primary btn-sm btn-outline gap-2 float-right mr-6 ${
              address !== queryAddress && "hidden"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit Identity
          </label>
          <div className="mx-6">
            <p className="text-2xl font-semibold">{mainDomain || "---"}.fil</p>
            <p className="text-sm">{queryAddress}</p>
          </div>
          <div className="mt-5">
            <Tab tabs={["Moments", "Likes", "Space DN"]} activeTab={currentTab} setActiveTab={setCurrentTab} />
            {tabPage}
          </div>
        </div>
      </Layout>
    </>
  );
}
