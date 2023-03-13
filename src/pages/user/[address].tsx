import { ArrowLeftIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import momenttools from "moment";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Avatar, Layout, Moment, PriceButton, Tab, ThemeToggle } from "@components";
import { ClockIcon, UserIcon } from "@heroicons/react/outline";
import { useFNSMarketContract, useMomentSwapContract, useSpaceFNSContract, useWalletProvider } from "@hooks";
import { MomentMetadata } from "@utils/definitions/interfaces";
import { secondsToYears, yearsToSeconds } from "@utils/helpers";
import { collectionToMoments } from "@utils/helpers/collection-to-moments";
import { ethers } from "ethers";
import Link from "next/link";

interface SpaceSlot {
  id: string;
  name: string;
  used: boolean;
  listed: boolean;
  start?: number;
  end?: number;
  expire?: number;
  price?: string;
  user?: string;
}

export default function UserPage() {
  const router = useRouter();
  const queryAddress = router.query.address as string;
  const { address: loginAddress } = useWalletProvider();
  const { getNFTCollectionByOwner } = useMomentSwapContract();
  //   const { mainDomain, subDomainIDs, subDomainNames, subDomainUsers } = useSpaceDomain(queryAddress);
  const [userImg, setUserImg] = useState<string | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState("Moments");
  const [tabPage, setTabPage] = useState(<></>);
  const [moments, setMoments] = useState<Array<MomentMetadata>>();
  const [selectedSlot, setSelectedSlot] = useState<SpaceSlot | undefined>(undefined);
  const [price, setPrice] = useState<string>("");
  const [leaseTermYears, setLeaseTermYears] = useState<number>(1);
  const [leaseName, setLeaseName] = useState<string>("");
  const [creatorSlots, setCreatorSlots] = useState<Array<SpaceSlot | undefined>>([]);
  const [userSlots, setUserSlots] = useState<Array<SpaceSlot>>([]);
  const [loading, setLoading] = useState(false);
  const [mainDomain, setMainDomain] = useState("");
  const {
    approve,
    mintSubDomain,
    getAllDomainByCreator,
    getApprovedByDomainID,
    getDomainLeaseTermsByCreator,
    getDomainLeaseTermsByUser,
  } = useSpaceFNSContract();
  const { getListedDomainsByDomainID, listDomain, lendDomain, updateListDomain, cancelListDomain } =
    useFNSMarketContract();

  useEffect(() => {
    (async () => {
      const _creatorSlots: Array<SpaceSlot | undefined> = [];
      const _userSlots: Array<SpaceSlot> = [];
      const [_mainDomain, _subDomainIDs, _subDomainNames, _subDomainUsers] = await getAllDomainByCreator(queryAddress);
      setMainDomain(_mainDomain);

      // Get all domain names created by user
      const [, , _creatorLeaseTerms] = await getDomainLeaseTermsByCreator(queryAddress);
      for (let i of [0, 1, 2, 3, 4]) {
        if (_subDomainIDs[i]) {
          const [_domainID, _price, _expire] = await getListedDomainsByDomainID(_subDomainIDs[i].toString());

          const _used = _subDomainUsers[i] !== queryAddress;
          const _listed = !_domainID.isZero();

          _creatorSlots.push({
            id: _subDomainIDs[i].toString(),
            name: _subDomainNames[i],
            used: _used,
            listed: _listed,
            start: _used ? _creatorLeaseTerms[i][0].toNumber() : undefined,
            end: _used ? _creatorLeaseTerms[i][0].toNumber() + _creatorLeaseTerms[i][1].toNumber() : undefined,
            expire: _listed ? _expire.toNumber() : undefined,
            price: ethers.utils.formatUnits(_price || "0", 18),
            user: _subDomainUsers[i],
          });
        } else {
          _creatorSlots.push(undefined);
        }
      }
      setCreatorSlots(_creatorSlots);

      // Get all domain lease terms rented by user
      const [_domainIDs, _fullDomainNames, _userLeaseTerms] = await getDomainLeaseTermsByUser(queryAddress);
      console.log(">>>", [_domainIDs, _fullDomainNames, _userLeaseTerms]);
    })();
  }, [queryAddress, getAllDomainByCreator, getDomainLeaseTermsByCreator, getListedDomainsByDomainID]);

  const priceOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!validatePrice(value)) {
      return;
    }
    setPrice(value || "0");
  };

  const leaseTermOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLeaseTermYears(Number(value));
  };

  const leaseNameOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLeaseName(e.target.value);
  };

  const handleMint = async () => {
    let readyMintIndex;
    for (let i in creatorSlots) {
      if (creatorSlots[i] == undefined) {
        readyMintIndex = i;
        break;
      }
    }

    if (readyMintIndex == undefined) {
      alert("Only 5 subdomain can be mint at most");
      return;
    }

    try {
      await (
        await mintSubDomain(mainDomain, `space${parseInt(readyMintIndex) + 1}`)
      ).wait;
      alert("Mint success !");
    } catch {
      alert("Failed to mint");
    }
  };

  const handleList = async () => {
    if (!selectedSlot) {
      router.reload();
      alert("Failed to list");
      return;
    }

    setLoading(true);
    try {
      const _marketAddress = await getApprovedByDomainID(selectedSlot.id);
      if (_marketAddress === "0x0000000000000000000000000000000000000000") {
        await (await approve(selectedSlot.id)).wait();
      }
      await (
        await listDomain(selectedSlot.id, ethers.utils.parseEther(price).toString(), yearsToSeconds(leaseTermYears))
      ).wait();
      alert("List success !");
    } catch {
      alert("Failed to list");
    }
    setLoading(false);
    router.reload();
  };

  const handleCancelList = async () => {
    if (!selectedSlot) {
      router.reload();
      alert("Failed to cancel list");
      return;
    }

    setLoading(true);
    try {
      await (await cancelListDomain(selectedSlot.id)).wait();
      alert("Cancel list success !");
    } catch {
      alert("Failed to cancel list");
    }
    setLoading(false);
    router.reload();
  };

  const handleUpdateList = async () => {
    if (!selectedSlot) {
      router.reload();
      alert("Failed to update");
      return;
    }

    setLoading(true);
    try {
      await (
        await updateListDomain(
          selectedSlot.id,
          ethers.utils.parseEther(price).toString(),
          yearsToSeconds(leaseTermYears),
        )
      ).wait();
      alert("Update success !");
    } catch {
      alert("Failed to update");
    }
    setLoading(false);
    router.reload();
  };

  const handleConfirmLease = async () => {
    if (!validateLeaseName(leaseName)) {
      alert("The name is between 3 and 10 characters");
      return;
    }

    if (!selectedSlot) {
      return;
    }

    try {
      setLoading(true);
      await (await lendDomain(selectedSlot.id)).wait();
      alert("Buy success !");
    } catch {
      alert("Failed to buy");
    }
    setLoading(false);
    router.reload();
  };

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
        {/* Sell Modal */}
        <input type="checkbox" id="sell-modal" className="modal-toggle" />
        <label htmlFor="sell-modal" className="modal cursor-pointer select-none">
          <label htmlFor="" className="modal-box px-14">
            <label htmlFor="sell-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <h3 className="font-bold text-lg">List Space Domain</h3>

            <div className="my-5">
              <h4 className="font-medium mt-8 mb-2">Price</h4>
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
              <h4 className="font-medium mt-8 mb-2">Lease Term</h4>
              <p className="text-right">
                {leaseTermYears} <span className="text-sm">{leaseTermYears === 1 ? "YEAR" : "YEARS"}</span>
              </p>
              <input
                type="range"
                min="1"
                max="5"
                value={leaseTermYears}
                onChange={leaseTermOnChange}
                className="range range-xs range-primary"
                step="1"
              />
              <div className="w-full flex justify-between text-xs px-2 text-primary-focus">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
              </div>
            </div>

            <div className="divider" />
            <div className="modal-action">
              <label className={`btn btn-primary ${loading ? "loading" : ""}`} onClick={handleList}>
                List
              </label>
            </div>
          </label>
        </label>

        {/* Update Modal */}
        <input type="checkbox" id="update-modal" className="modal-toggle" />
        <label htmlFor="update-modal" className="modal cursor-pointer select-none">
          <label htmlFor="" className="modal-box px-14">
            <label htmlFor="update-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <h3 className="font-bold text-lg">Edit Space Domain</h3>

            <div className="my-5">
              <h4 className="font-medium mt-8 mb-2">Price</h4>
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
              <h4 className="font-medium mt-8 mb-2">Lease Term</h4>
              <p className="text-right">
                {leaseTermYears} <span className="text-sm">{leaseTermYears === 1 ? "YEAR" : "YEARS"}</span>
              </p>
              <input
                type="range"
                min="1"
                max="5"
                value={leaseTermYears}
                onChange={leaseTermOnChange}
                className="range range-xs range-primary"
                step="1"
              />
              <div className="w-full flex justify-between text-xs px-2 text-primary-focus">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
              </div>
            </div>

            <div className="divider" />
            <div className="modal-action">
              <label className={`btn btn-secondary ${loading ? "loading" : ""}`} onClick={handleCancelList}>
                Unlist
              </label>
              <label className={`btn btn-primary ${loading ? "loading" : ""}`} onClick={handleUpdateList}>
                Update
              </label>
            </div>
          </label>
        </label>

        {/* Buy Modal */}
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

        {/* Tab Content Page */}
        <div className="flex">
          <h3 className="text-lg font-semibold m-2">Space Slots</h3>
          <div
            onClick={handleMint}
            className="link font-mono font-medium text-primary active:text-primary-focus ml-auto my-auto mr-5"
          >
            Mint
          </div>
        </div>
        <div className="border-t-[1px] border-base-content/25">
          <AnimatePresence>
            {creatorSlots.map((slot, index) => (
              <motion.div
                key={index}
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
                    <span className="font-medium ">{`${slot?.name || "space" + (index + 1)}.${mainDomain}.fil`}</span>
                    <div className="flex-col text-xs">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {slot?.used ? (
                          <p>
                            <span className="badge badge-accent badge-xs">
                              {slot.start && momenttools.unix(slot.start).format("YYYY-MM-DD")}
                            </span>
                            <span>&nbsp;➞&nbsp;</span>
                            <span className="badge badge-accent badge-xs">
                              {slot.end && momenttools.unix(slot.end).format("YYYY-MM-DD")}
                            </span>
                          </p>
                        ) : slot?.listed ? (
                          <div className="badge badge-accent badge-xs">
                            {secondsToYears(slot.expire || 0)} {secondsToYears(slot.expire || 0) > 1 ? "Years" : "Year"}
                          </div>
                        ) : (
                          <>-</>
                        )}
                      </div>
                      <div className="flex items-center gap-1 w-0">
                        <div className="h-4 w-4">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        {slot?.used ? (
                          <Link className="font-mono underline" href={`/user/${slot.user}`}>
                            {slot.user}
                          </Link>
                        ) : (
                          <>-</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right area */}
                  <div className="mr-4">
                    {slot == undefined ? ( // subdomain is not mint
                      <></>
                    ) : !slot.listed && !slot.used ? ( // subdomain is minted
                      <label
                        htmlFor="sell-modal"
                        onClick={() => {
                          setSelectedSlot(slot);
                        }}
                        className="border-2 rounded-full hover:text-white hover:border-neutral active:border-neutral-focus hover:bg-neutral active:bg-neutral-focus w-32 h-8 overflow-hidden hvr-shadow text-sm text-center leading-7 font-bold"
                      >
                        Sell
                      </label>
                    ) : slot.listed ? ( // subdomain is listed
                      <PriceButton
                        onClick={() => {
                          setSelectedSlot(slot);
                          setPrice(slot?.price || "0");

                          const expireYears = secondsToYears(slot.expire || 1);

                          setLeaseTermYears(expireYears);
                        }}
                        iconSrc="https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png"
                        price={slot.price || "0.0"}
                        htmlFor="update-modal"
                      >
                        Edit
                      </PriceButton>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-info"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold m-2">Your Rented</h2>
            <div className="border-t-[1px] border-base-content/25">
              {userSlots.length == 0 ? (
                <div className="flex justify-center gap-2 mt-8">
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
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <p>No records</p>
                </div>
              ) : (
                <AnimatePresence>
                  {userSlots.map((slot, index) => (
                    <motion.div
                      key={index}
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
                          <span className="font-medium ">{`${slot.name}.${mainDomain}.fil`}</span>
                          <div className="flex-col text-xs">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              <p>
                                <span className="badge badge-accent badge-xs">
                                  {slot.start && momenttools.unix(slot.start).format("YYYY-MM-DD")}
                                </span>
                                <span>&nbsp;➞&nbsp;</span>
                                <span className="badge badge-accent badge-xs">
                                  {slot.end && momenttools.unix(slot.end).format("YYYY-MM-DD")}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 w-0">
                              <div className="h-4 w-4">
                                <UserIcon className="h-4 w-4" />
                              </div>
                              <Link className="font-mono underline" href={`/user/${slot.user}`}>
                                {slot.user}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </>
    );
    setTabPage(_tabPage);
  }, [loading, loginAddress, leaseTermYears, leaseName, price, queryAddress, creatorSlots, mainDomain]);

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
              loginAddress !== queryAddress && "hidden"
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
