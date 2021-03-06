import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { GET_GENRES, GET_FEATURED_MEDIA } from "../apollo/queries/local";
import MediaCard from "../components/media/MediaCard";
import MediaBanner from "../components/media/MediaBanner";
import ListView from "../ui/ListView";
import GroupedListView from "../ui/GroupedListView";
import { getMediaByType, getMediaList } from "../apollo/queries/remote";
import { ShortMedia } from "../types";
import { client } from "../apollo";
import "../styles/browse.scss";

export default () => {
  client.writeQuery({
    query: GET_FEATURED_MEDIA,
    data: {
      featuredMedia: []
    }
  });
  const cache = client.readQuery({ query: GET_GENRES });

  const bannerListData = [
    {
      query: getMediaByType("MANGA", "FAVOURITES_DESC", "RELEASING"),
      comment: "Current Favourite",
      force: true
    },
    ...cache.genres.map((genre: string) => ({
      query: getMediaByType(
        "MANGA",
        "SCORE_DESC",
        "RELEASING",
        undefined,
        undefined,
        [genre]
      ),
      comment: `Best ${genre}`
    }))
  ];

  const trending = useQuery(getMediaList(1, 20, "MANGA", "TRENDING_DESC"));
  const topRanked = useQuery(getMediaList(1, 20, "MANGA", "SCORE_DESC"));
  const popular = useQuery(getMediaList(1, 20, "MANGA", "POPULARITY_DESC"));

  if (trending.error) {
    trending.startPolling(1500);
  }
  if (topRanked.error) {
    topRanked.startPolling(1500);
  }
  if (popular.error) {
    popular.startPolling(1500);
  }

  if (trending.data && !trending.loading) {
    trending.stopPolling();
  }
  if (topRanked.data && !topRanked.loading) {
    topRanked.stopPolling();
  }
  if (popular.data && !popular.loading) {
    popular.stopPolling();
  }

  return (
    <div className="browse">
      <h1 className="title">Manga</h1>
      <ListView>
        {bannerListData.map((banner, index) => (
          <MediaBanner
            key={index}
            query={banner.query}
            comment={banner.comment}
            force={banner.force}
          />
        ))}
      </ListView>
      <ListView title="Trending">
        {trending.data
          ? trending.data.Page.media.map((media: ShortMedia, index: number) => (
              <MediaCard
                key={index}
                data={{
                  id: media.id,
                  type: media.type,
                  title: media.title.romaji,
                  coverImage: media.coverImage.large,
                  format: media.format,
                  genres: media.genres,
                  averageScore: media.averageScore
                }}
              />
            ))
          : []}
      </ListView>
      <GroupedListView title="Top Ranked">
        {topRanked.data
          ? topRanked.data.Page.media.map(
              (media: ShortMedia, index: number) => (
                <MediaCard
                  key={index}
                  data={{
                    id: media.id,
                    type: media.type,
                    title: media.title.romaji,
                    coverImage: media.coverImage.medium,
                    format: media.format,
                    genres: media.genres,
                    averageScore: media.averageScore
                  }}
                  size="SMALL"
                />
              )
            )
          : []}
      </GroupedListView>
      <GroupedListView title="Most Popular" style={{ marginBottom: 0 }}>
        {popular.data
          ? popular.data.Page.media.map((media: ShortMedia, index: number) => (
              <MediaCard
                key={index}
                data={{
                  id: media.id,
                  type: media.type,
                  title: media.title.romaji,
                  coverImage: media.coverImage.medium,
                  format: media.format,
                  genres: media.genres,
                  averageScore: media.averageScore
                }}
                size="SMALL"
              />
            ))
          : []}
      </GroupedListView>
    </div>
  );
};
