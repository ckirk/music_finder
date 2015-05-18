class ChangeAlbumToTrack < ActiveRecord::Migration
  def change
  	rename_column :queries, :album, :track
  end
end
