class QueryResult < ActiveRecord::Base
	belongs_to :result
	belongs_to :query
end