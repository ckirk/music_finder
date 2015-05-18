class Query < ActiveRecord::Base
	has_many :query_results, dependent: :destroy
	has_many :results, through: :query_results, dependent: :destroy
	#dependent: :destroy # if you destroy the collection, destroy all associated collection videos
end