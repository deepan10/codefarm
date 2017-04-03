
import { themr } from "react-css-themr";
import { DATA_CARD } from "../identifiers";
import theme from "./theme.scss";

import CardList from "./CardList";
import TypeCard from "./TypeCard";
import RevisionCard from "./RevisionCard";
import JobCard from "./JobCard";
import SubJobCard from "./SubJobCard";
import ClaimCard from "./ClaimCard";
import CommentCard from "./CommentCard";
import AddCommentCard from "./AddCommentCard";
import ReviewCard from "./ReviewCard";
import ArtifactCard from "./ArtifactCard";
import LogCard from "./LogCard";
import StepResultCard from "./StepResultCard";
import CodeRepositoryCard from "./CodeRepositoryCard";
import ArtifactRepositoryCard from "./ArtifactRepositoryCard";
import UserCard from "./UserCard";
import TeamCard from "./TeamCard";
import PolicyCard from "./PolicyCard";
import StatSpecCard from "./StatSpecCard";
import StatStatCard from "./StatStatCard";
import StatStatInfoCard from "./StatStatInfoCard";
import StatChartCard from "./StatChartCard";

const ThemedCardList = themr(DATA_CARD, theme)(CardList);
const ThemedTypeCard = themr(DATA_CARD, theme)(TypeCard);
const ThemedRevisionCard = themr(DATA_CARD, theme)(RevisionCard);
const ThemedJobCard = themr(DATA_CARD, theme)(JobCard);
const ThemedSubJobCard = themr(DATA_CARD, theme)(SubJobCard);
const ThemedClaimCard = themr(DATA_CARD, theme)(ClaimCard);
const ThemedCommentCard = themr(DATA_CARD, theme)(CommentCard);
const ThemedAddCommentCard = themr(DATA_CARD, theme)(AddCommentCard);
const ThemedReviewCard = themr(DATA_CARD, theme)(ReviewCard);
const ThemedArtifactCard = themr(DATA_CARD, theme)(ArtifactCard);
const ThemedLogCard = themr(DATA_CARD, theme)(LogCard);
const ThemedStepResultCard = themr(DATA_CARD, theme)(StepResultCard);
const ThemedCodeRepositoryCard = themr(DATA_CARD, theme)(CodeRepositoryCard);
const ThemedArtifactRepositoryCard = themr(DATA_CARD, theme)(ArtifactRepositoryCard);
const ThemedUserCard = themr(DATA_CARD, theme)(UserCard);
const ThemedTeamCard = themr(DATA_CARD, theme)(TeamCard);
const ThemedPolicyCard = themr(DATA_CARD, theme)(PolicyCard);
const ThemedStatSpecCard = themr(DATA_CARD, theme)(StatSpecCard);
const ThemedStatStatCard = themr(DATA_CARD, theme)(StatStatCard);
const ThemedStatStatInfoCard = themr(DATA_CARD, theme)(StatStatInfoCard);
const ThemedStatChartCard = themr(DATA_CARD, theme)(StatChartCard);

export { ThemedCardList as CardList };
export { ThemedTypeCard as TypeCard };
export { ThemedRevisionCard as RevisionCard };
export { ThemedJobCard as JobCard };
export { ThemedSubJobCard as SubJobCard };
export { ThemedCommentCard as CommentCard };
export { ThemedClaimCard as ClaimCard };
export { ThemedAddCommentCard as AddCommentCard };
export { ThemedReviewCard as ReviewCard };
export { ThemedArtifactCard as ArtifactCard };
export { ThemedLogCard as LogCard };
export { ThemedStepResultCard as StepResultCard };
export { ThemedCodeRepositoryCard as CodeRepositoryCard };
export { ThemedArtifactRepositoryCard as ArtifactRepositoryCard };
export { ThemedUserCard as UserCard };
export { ThemedTeamCard as TeamCard };
export { ThemedPolicyCard as PolicyCard };
export { ThemedStatSpecCard as StatSpecCard };
export { ThemedStatStatCard as StatStatCard };
export { ThemedStatStatInfoCard as StatStatInfoCard };
export { ThemedStatChartCard as StatChartCard };
