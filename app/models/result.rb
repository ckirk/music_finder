class Result < ActiveRecord::Base
	#belongs_to :query_result
	has_one :query_result
	has_one :query, through: :query_results
end