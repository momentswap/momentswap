import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import hre from "hardhat";
import { Account, Moment, SpaceFNS } from "../typechain-types";

describe("Jointly debugging contracts for Account, Domain, and Moment", function () {
  let account: Account;
  let moment: Moment;
  let spaceFNS: SpaceFNS;
  let wallets: SignerWithAddress[];

  async function fixture() {
    await hre.run("compile");

    const accountFactory = await hre.ethers.getContractFactory("Account");
    const spaceFNSFactory = await hre.ethers.getContractFactory("SpaceFNS");
    const momentFactory = await hre.ethers.getContractFactory("Moment");

    moment = await momentFactory.deploy();
    spaceFNS = await spaceFNSFactory.deploy();
    account = await accountFactory.deploy(moment.address, spaceFNS.address);

    wallets = await hre.ethers.getSigners();
  }

  beforeEach(async () => {
    await loadFixture(fixture);
  });

  describe("Set caller", function () {
    it("Should allow setting the contract caller for Moment and SpaceFNS", async function () {
      await moment.setCaller(account.address);
      await spaceFNS.setCaller(account.address);
      expect(await moment.caller()).to.equal(account.address);
      expect(await spaceFNS.caller()).to.equal(account.address);
    });

    it("Should revert if non-owner setting the contract caller for Moment and SpaceFNS", async function () {
      await expect(moment.connect(wallets[1]).setCaller(account.address)).to.revertedWith(
        "Ownable: caller is not the owner",
      );
      await expect(spaceFNS.connect(wallets[1]).setCaller(account.address)).to.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  describe("Primary Space Domain", function () {
    beforeEach(async () => {
      await spaceFNS.setCaller(account.address);
    });

    it("Should revert if primary domain name is less than 3 characters or greater than 10 characters", async function () {
      await expect(
        account.createAccount("do", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu"),
      ).to.be.revertedWithCustomError(spaceFNS, "DomainNameError");

      await expect(
        account.createAccount("longdomainname", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu"),
      ).to.be.revertedWithCustomError(spaceFNS, "DomainNameError");
    });

    it("Should allow creating account if domain name is valid", async function () {
      const domainName = "foo";
      const avatarURI = "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu";

      await account.createAccount(domainName, avatarURI);
      await account.connect(wallets[1]).createAccount("bar", avatarURI);

      const accountIds = await account.batchGetAccountId([wallets[0].address, wallets[1].address]);
      expect(accountIds[0]).to.equal(BigNumber.from(1));
      expect(accountIds[1]).to.equal(BigNumber.from(2));

      expect((await account.getCreatedSpaceIds(1))[0]).to.equal(BigNumber.from(1));
      expect(await spaceFNS.getSpaceDomainCreatorId(1)).to.equal(BigNumber.from(1));
      expect(await spaceFNS.getSpaceDomainUserId(1)).to.equal(BigNumber.from(1));

      const spaceDomain = await spaceFNS.getSpaceDomainByID(1);
      // struct SpaceDomain {
      //   uint64 creatorId;
      //   uint64 userId;
      //   uint64 expireSeconds;
      //   uint64 primarySpaceId;
      //   string domainName;
      // }
      expect(spaceDomain[0]).to.equal(BigNumber.from(1));
      expect(spaceDomain[1]).to.equal(BigNumber.from(1));
      expect(spaceDomain[3]).to.equal(BigNumber.from(0));
      expect(spaceDomain[4]).to.equal(domainName);

      const batchAccountData = await account.batchGetAccountData([1, 2]);
      // struct AccountData {
      //   address owner;              // The address that owns this account.
      //   string avatarURI;           // The URI of the avatar image associated with this account.
      //   uint120[] momentIds;        // An array of IDs representing the moments created by this account.
      //   uint128[] commentIds;       // An array of IDs representing the comments made by this account.
      //   uint120[] likedMomentIds;   // An array of IDs representing the moments that this account has liked.
      //   uint64[] createdSpaceIds;    // An array of IDs representing the spaces that this account has created.
      //   uint64[] rentedSpaceIds;    // An array of IDs representing the spaces that this account is currently renting.
      // }
      expect(batchAccountData[0][0]).to.equal(wallets[0].address);
      expect(batchAccountData[0][1]).to.equal(avatarURI);
      expect(batchAccountData[0][5][0]).to.equal(BigNumber.from(1));
      expect(batchAccountData.length).to.equal(2);
      expect(batchAccountData[1][0]).to.equal(wallets[1].address);
      expect(batchAccountData[1][1]).to.equal(avatarURI);
      expect(batchAccountData[1][5][0]).to.equal(BigNumber.from(2));
    });

    it("Should revert if account duplicate registration", async function () {
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await expect(
        account.createAccount("bar", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu"),
      ).to.be.revertedWithCustomError(account, "AccountAlreadyExists");
    });

    it("Should revert if primary domain name duplication registration", async function () {
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await expect(
        account
          .connect(wallets[1])
          .createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu"),
      ).to.be.revertedWithCustomError(spaceFNS, "DomainAlreadyExists");
    });

    it("Should allow account cancellation", async function () {
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await account.cancelAccount();
      expect((await account.batchGetAccountId([wallets[0].address]))[0]).to.equal(BigNumber.from(0));
      expect((await account.batchGetAccountData([1]))[0][0]).to.equal("0x0000000000000000000000000000000000000000");
      expect((await account.batchGetAccountData([1]))[0][1]).to.equal("");
    });

    it("Should allow updating avatar URI", async function () {
      const oldAvatar = "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu";
      const newAvatar = "ipfs://bafkreihby2cftowhtmdwvgat7r22w2nrl4ekjqeslbjnlx6ltimiujncg4";
      await account.createAccount("foo", oldAvatar);
      await account.updateAvatarURI(newAvatar);
      expect((await account.batchGetAccountData([1]))[0][1]).to.equal(newAvatar);
    });
  });

  describe("Sub Space Domain", function () {
    beforeEach(async () => {
      await spaceFNS.setCaller(account.address);
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
    });

    it("Should allow creating subdomain", async function () {
      await account.createSubSpaceDomain(1, "bar", 1000);
      const createdSpaceIds = await account.getCreatedSpaceIds(1);
      expect(createdSpaceIds[0]).to.equal(BigNumber.from(1));
      expect(createdSpaceIds[1]).to.equal(BigNumber.from(2));

      const [primaryDomain, subdomain] = await spaceFNS.getPrimaryAndSubDomain(2);
      expect(primaryDomain).to.equal("foo");
      expect(subdomain).to.equal("bar.foo");

      expect((await account.getCreatedSpaceIds(1))[1]).to.equal(BigNumber.from(2));
      expect(await spaceFNS.getSpaceDomainCreatorId(2)).to.equal(BigNumber.from(1));
      expect(await spaceFNS.getSpaceDomainUserId(2)).to.equal(BigNumber.from(1));

      const spaceDomain = await spaceFNS.getSpaceDomainByID(2);
      // struct SpaceDomain {
      //   uint64 creatorId;
      //   uint64 userId;
      //   uint64 expireSeconds;
      //   uint64 primarySpaceId;
      //   string domainName;
      // }
      expect(spaceDomain[0]).to.equal(BigNumber.from(1));
      expect(spaceDomain[1]).to.equal(BigNumber.from(1));
      expect(spaceDomain[2]).to.equal(BigNumber.from(1000));
      expect(spaceDomain[3]).to.equal(BigNumber.from(1));
      expect(spaceDomain[4]).to.equal("bar.foo");
    });

    it("Should revert if the number of subdomains created exceeds the limit", async function () {
      const limit = await account.subSpaceDomainLimit();
      for (let i = 1; i <= limit.toNumber(); i++) {
        await account.createSubSpaceDomain(1, `bar${i}`, 1000);
      }
      await expect(account.createSubSpaceDomain(1, "bar0", 1000)).to.revertedWithCustomError(
        account,
        "MaximumNumberOfSpaceDomainsReached",
      );
    });

    it("Should allow setting subdomain limit", async function () {
      await account.setSubSpaceDomainLimit(98);
      expect(await account.subSpaceDomainLimit()).to.equal(BigNumber.from(98));
    });

    it("Should allow rent space", async function () {
      await account
        .connect(wallets[1])
        .createAccount("bar", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await account.createSubSpaceDomain(1, "subdomain", 1000);

      await account.approve(wallets[2].address, 3);
      await account.connect(wallets[2]).rentSpace(2, 3);
      expect((await account.connect(wallets[1]).getRentedSpaceIds(2))[0]).to.equal(BigNumber.from(3));
      expect(await spaceFNS.getSpaceDomainCreatorId(3)).to.equal(BigNumber.from(1));
      expect(await spaceFNS.getSpaceDomainUserId(3)).to.equal(BigNumber.from(2));
    });

    it("Should allow return space", async function () {
      await account
        .connect(wallets[1])
        .createAccount("bar", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await account.createSubSpaceDomain(1, "subdomain", 0);
      await account.approve(wallets[2].address, 3);

      await account.connect(wallets[2]).rentSpace(2, 3);
      expect((await account.connect(wallets[1]).getRentedSpaceIds(2))[0]).to.equal(BigNumber.from(3));

      await account.returnSpace(2, 3);
      expect((await account.connect(wallets[1]).getRentedSpaceIds(2)).length).to.equal(0);
    });
  });

  describe("Moment", function () {
    beforeEach(async () => {
      await moment.setCaller(account.address);
      await spaceFNS.setCaller(account.address);
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
    });

    it("Should allow creating momnet", async function () {
      const metadataURI = "ipfs://bafyreiarydudpizgiikhkvtw4z3hiyv2riof7hpmfsxlsbezvonehnjzye/metadata.json";
      const mintFee = account.mintFee();
      await account.createMoment(metadataURI, { value: mintFee });
      await account.createMoment(metadataURI, { value: mintFee });
      await account.createMoment(metadataURI, { value: mintFee });

      const momentIds = await account.getMomentIds(1);
      expect(momentIds.length).to.equal(3);
      expect(momentIds[0]).to.equal(BigNumber.from(1));
      expect(momentIds[1]).to.equal(BigNumber.from(2));
      expect(momentIds[2]).to.equal(BigNumber.from(3));

      const myMoments = await moment.getMomentData(momentIds);
      expect(myMoments.length).to.equal(3);
      expect(myMoments[0][0]).to.equal(BigNumber.from(1));
      expect(myMoments[1][2]).to.equal(false);
      expect(myMoments[2][3]).to.equal(metadataURI);

      const allMoments = await moment.getAllMoments();
      // struct MomentData {
      //   uint64 creatorId;   // The ID of the account that created this moment.
      //   uint64 timestamp;   // The timestamp at which this moment was created.
      //   bool deleted;       // Whether or not this moment has been deleted.
      //   string metadataURI; // The URI of the metadata associated with this moment.
      // }
      expect(allMoments.length).to.equal(3);
      expect(allMoments[1][0]).to.equal(BigNumber.from(1));
      expect(allMoments[2][2]).to.equal(false);
      expect(allMoments[0][3]).to.equal(metadataURI);
    });

    it("Should allow removing moment", async function () {
      const metadataURI = "ipfs://bafyreiarydudpizgiikhkvtw4z3hiyv2riof7hpmfsxlsbezvonehnjzye/metadata.json";
      const mintFee = account.mintFee();
      await account.createMoment(metadataURI, { value: mintFee });
      await account.createMoment(metadataURI, { value: mintFee });
      await account.createMoment(metadataURI, { value: mintFee });
      await account.removeMoment(1);
      await account.removeMoment(3);

      const momentIds = await account.getMomentIds(1);
      expect(momentIds.length).to.equal(1);
      expect(momentIds[0]).to.equal(BigNumber.from(2));

      const myMoments = await moment.getMomentData(momentIds);
      expect(myMoments.length).to.equal(1);
      expect(myMoments[0][0]).to.equal(BigNumber.from(1));
      expect(myMoments[0][2]).to.equal(false);
      expect(myMoments[0][3]).to.equal(metadataURI);

      const allMoments = await moment.getAllMoments();
      expect(allMoments.length).to.equal(3);
      expect(allMoments[0][2]).to.equal(true);
      expect(allMoments[1][2]).to.equal(false);
      expect(allMoments[2][2]).to.equal(true);
    });

    it("Should allow setting mintFee", async function () {
      await account.setMintFee(1234567890);
      expect(await account.mintFee()).to.equal(BigNumber.from(1234567890));
    });

    it("Should allow setting beneficiary", async function () {
      expect(await account.beneficiary()).to.equal(wallets[0].address);
      await account.setBeneficiary(wallets[1].address);
      expect(await account.beneficiary()).to.equal(wallets[1].address);
    });
  });

  describe("Comment", function () {
    beforeEach(async () => {
      await moment.setCaller(account.address);
      await spaceFNS.setCaller(account.address);
      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      const mintFee = account.mintFee();
      await account.createMoment("ipfs://bafyreiarydudpizgiikhkvtw4z3hiyv2riof7hpmfsxlsbezvonehnjzye/metadata.json", {
        value: mintFee,
      });
    });

    it("Should allow create comment", async function () {
      const commentText = "Hello World!";
      await account.createComment(1, commentText);
      await account.createComment(1, commentText);
      await account.createComment(1, commentText);

      const commentIds = await account.getCommentIds(1);
      expect(commentIds.length).to.equal(3);
      expect(commentIds[0]).to.equal(BigNumber.from(1));
      expect(commentIds[1]).to.equal(BigNumber.from(2));
      expect(commentIds[2]).to.equal(BigNumber.from(3));

      const myComments = await moment.getComments(commentIds);
      // struct CommentData {
      //   uint64 creatorId;   // The ID of the account that created this comment.
      //   uint64 timestamp;   // The timestamp at which this comment was created.
      //   uint120 momentId;   // The ID of the moment that this comment is associated with.
      //   bool deleted;       // Whether or not this comment has been deleted.
      //   string text;        // The text of the comment.
      // }
      expect(myComments.length).to.equal(3);
      expect(myComments[0][0]).to.equal(BigNumber.from(1));
      expect(myComments[1][2]).to.equal(BigNumber.from(1));
      expect(myComments[2][4]).to.equal(commentText);
    });

    it("Should allow removing comment", async function () {
      const commentText = "Hello World!";
      await account.createComment(1, commentText);
      await account.createComment(1, commentText);
      await account.createComment(1, commentText);
      await account.removeComment(1);
      await account.removeComment(3);

      const commentIds = await account.getCommentIds(1);
      expect(commentIds.length).to.equal(1);
      expect(commentIds[0]).to.equal(BigNumber.from(2));

      const myComments = await moment.getComments([1, 2, 3]);
      expect(myComments.length).to.equal(3);
      expect(myComments[0][3]).to.equal(true);
      expect(myComments[1][3]).to.equal(false);
      expect(myComments[2][3]).to.equal(true);
    });
  });

  describe("LikeMoment", function () {
    beforeEach(async () => {
      const metadataURI = "ipfs://bafyreiarydudpizgiikhkvtw4z3hiyv2riof7hpmfsxlsbezvonehnjzye/metadata.json";
      const mintFee = account.mintFee();

      await moment.setCaller(account.address);
      await spaceFNS.setCaller(account.address);

      await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
      await account
        .connect(wallets[1])
        .createAccount("bar", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");

      await account.createMoment(metadataURI, { value: mintFee });
      await account.createMoment(metadataURI, { value: mintFee });
      await account.connect(wallets[1]).createMoment(metadataURI, { value: mintFee });

      await account.connect(wallets[1]).createMoment(metadataURI, { value: mintFee });
    });

    it("Should allow like moment", async function () {
      await account.likeMoment(1);
      await account.likeMoment(2);
      await account.likeMoment(3);
      await account.likeMoment(4);
      await account.connect(wallets[1]).likeMoment(4);

      const likedMomentIds = await account.getLikedMomentIds(1);
      expect(likedMomentIds.length).to.equal(4);
      expect(likedMomentIds[0]).to.equal(1);
      expect(likedMomentIds[1]).to.equal(2);
      expect(likedMomentIds[2]).to.equal(3);
      expect(likedMomentIds[3]).to.equal(4);

      const likedAccountIds = await moment.getLikes([1, 4]);
      expect(likedAccountIds.length).to.equal(2);
      expect(likedAccountIds[0]).to.equal(BigNumber.from(1));
      expect(likedAccountIds[1]).to.equal(BigNumber.from(2));
    });

    it("Should allow unlike moment", async function () {
      await account.likeMoment(1);
      await account.likeMoment(2);
      await account.likeMoment(3);
      await account.likeMoment(4);
      await account.connect(wallets[1]).likeMoment(4);
      await account.cancelLikeMoment(1);
      await account.cancelLikeMoment(4);

      const likedMomentIds = await account.getLikedMomentIds(1);
      expect(likedMomentIds.length).to.equal(2);
      expect(likedMomentIds[0]).to.equal(3);
      expect(likedMomentIds[1]).to.equal(2);

      const likedAccountIds = await moment.getLikes([1, 4]);
      expect(likedAccountIds.length).to.equal(2);
      expect(likedAccountIds[0]).to.equal(BigNumber.from(0));
      expect(likedAccountIds[1]).to.equal(BigNumber.from(1));
    });
  });
});
