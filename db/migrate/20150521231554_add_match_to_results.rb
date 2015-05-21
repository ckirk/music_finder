class AddMatchToResults < ActiveRecord::Migration
  def change
    add_column :results, :match, :boolean
    add_column :results, :query_id, :integer
  end
end
